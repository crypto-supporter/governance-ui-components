import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withApollo } from 'react-apollo';

import { Button, Select } from '@digix/gov-ui/components/common/elements/index';
import { Title, CommentFilter, CommentList } from '@digix/gov-ui/pages/proposals/comment/style';

import CommentTextEditor from '@digix/gov-ui/pages/proposals/comment/editor';
import ParentThread from '@digix/gov-ui/pages/proposals/comment/thread';

import { CommentsApi } from '@digix/gov-ui/api/comments';
import { fetchThreadsQuery } from '@digix/gov-ui/api/graphql-queries/comments';
import { fetchUserQuery } from '@digix/gov-ui/api/graphql-queries/users';
import { getAddressDetails } from '@digix/gov-ui/reducers/info-server/actions';
import { getDaoProposalDetails } from '@digix/gov-ui/reducers/dao-server/actions';
import { initializePayload } from '@digix/gov-ui/api';
import { showHideAlert } from '@digix/gov-ui/reducers/gov-ui/actions';
import { UsersApi } from '@digix/gov-ui/api/users';

class CommentThread extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: {
        address: props.uid,
        displayName: '',
        isForumAdmin: false,
      },
      sortBy: 'LATEST',
      threads: null,
      userAddresses: [],
      userPoints: {},
    };

    this.FILTERS = [
      {
        text: 'Latest',
        value: 'LATEST',
      },
      {
        text: 'Oldest',
        value: 'OLDEST',
      },
    ];

    // for invalidating comments cache in apollo
    this.CACHED_COMMENT_KEYS = /^(Comment|\$Comment|commentThreads|\$ROOT_QUERY\.commentThreads)/;

    this.THREAD_COUNT = 10;
    this.REPLY_COUNT = 5;
    this.COMMENT_COUNT = 3;
  }

  componentDidMount() {
    const { sortBy } = this.state;
    const { ChallengeProof, proposalId, uid } = this.props;

    this.props.getAddressDetails(uid).then(() => {
      const { address, quarterPoint, reputationPoint } = this.props.addressDetails;
      const userPoints = {};
      userPoints[address] = {
        reputation: reputationPoint,
        quarterPoints: quarterPoint,
      };

      this.setState({
        userAddresses: [address],
        userPoints,
      });
    });

    this.fetchThreads({ sortBy });
    this.fetchCurrentUser();
    if (!ChallengeProof.data) {
      return;
    }

    const payload = initializePayload(ChallengeProof);
    this.props.getDaoProposalDetails({ proposalId, ...payload }).catch(() => {
      this.setError(CommentsApi.ERROR_MESSAGES.fetch);
    });
  }

  // NOTE: there's no method for partial cache invalidation in apollo so we have to do it manually here.
  // Ref: https://github.com/apollographql/apollo-feature-requests/issues/4
  componentWillUnmount() {
    const apollo = this.props.client;
    const cache = apollo.store.cache.data;
    if (!cache || !cache.data) {
      return;
    }

    Object.keys(cache.data).forEach(key => {
      if (key.match(this.CACHED_COMMENT_KEYS)) {
        cache.delete(key);
      }
    });
  }

  getQueryVariables(vars) {
    const { proposalId } = this.props;

    return {
      proposalId,
      threadCount: this.THREAD_COUNT,
      replyCount: this.REPLY_COUNT,
      commentCount: this.COMMENT_COUNT,
      ...vars,
    };
  }

  setCommentingPrivileges = canComment => {
    const { currentUser } = this.state;
    currentUser.canComment = canComment;
    this.setState({ currentUser });
  };

  setError = error => {
    const message = JSON.stringify(error && error.message) || error;
    this.props.showHideAlert({ message });
  };

  handleFilterChange = e => {
    const sortBy = e.target.value;
    this.fetchThreads({ sortBy });
    this.setState({ sortBy });
  };

  addThread = body => {
    const {
      ChallengeProof,
      rootCommentId: {
        data: { commentId: rootCommentId },
      },
    } = this.props;
    if (!ChallengeProof || !rootCommentId) {
      this.setError(CommentsApi.ERROR_MESSAGES.createComment);
      return;
    }

    let { threads } = this.state;
    const { currentUser, sortBy } = this.state;
    const payload = initializePayload(ChallengeProof);

    CommentsApi.create(rootCommentId, body, payload)
      .then(node => {
        const newComment = CommentsApi.generateNewComment(node, currentUser, rootCommentId);
        if (!threads || !threads.edges.length) {
          threads = CommentsApi.generateNewThread(newComment);
        } else if (sortBy === 'OLDEST') {
          threads.edges.push(newComment);
          window.scrollTo(0, document.body.scrollHeight);
        } else {
          threads.edges.unshift(newComment);
        }

        this.setState({ threads });
      })
      .catch(message => {
        const error = CommentsApi.ERROR_MESSAGES;
        if (message === 'unauthorized_action') {
          this.setCommentingPrivileges(false);
          this.setError(error.bannedUser);
        } else {
          this.setError(error.createReply);
        }
      });
  };

  fetchCurrentUser() {
    const apollo = this.props.client;
    const query = {
      query: fetchUserQuery,
      fetchPolicy: 'network-only',
    };

    apollo.query(query).then(response => {
      const { currentUser } = response.data;
      this.setState({ currentUser });
    });
  }

  fetchThreads(vars) {
    const apollo = this.props.client;
    const variables = this.getQueryVariables(vars);

    apollo
      .query({
        fetchPolicy: 'network-only',
        query: fetchThreadsQuery,
        variables,
      })
      .then(result => {
        const threads = result.data.commentThreads;
        this.setState({ threads }, () => {
          this.fetchUserPoints(threads);
        });
      });
  }

  fetchUserPoints = threads => {
    const { userAddresses } = this.state;
    const { ChallengeProof, uid } = this.props;

    if (!ChallengeProof.data) {
      return;
    }

    const newUniqueAddresses = CommentsApi.getUniqueUsers(userAddresses, threads);
    this.setState({ userAddresses: newUniqueAddresses });
    const payload = initializePayload(ChallengeProof);

    UsersApi.getPoints(newUniqueAddresses, payload)
      .then(userPoints => {
        const { addressDetails } = this.props;
        userPoints[uid] = {
          reputation: addressDetails.reputationPoint,
          quarterPoints: addressDetails.quarterPoint,
        };

        this.setState({ userPoints });
      })
      .catch(() => {
        this.setError(UsersApi.ERROR_MESSAGES.getPoints);
      });
  };

  loadMore = endCursor => {
    const { sortBy, threads } = this.state;
    const apollo = this.props.client;
    const variables = this.getQueryVariables({
      endCursor,
      sortBy,
    });

    apollo
      .query({
        fetchPolicy: 'network-only',
        query: fetchThreadsQuery,
        variables,
      })
      .then(result => {
        const data = result.data.commentThreads;
        threads.edges = threads.edges.concat(data.edges);
        threads.hasNextPage = data.hasNextPage;
        threads.endCursor = data.endCursor;
        this.setState({ threads });
      });
  };

  renderThreads(threadList) {
    const { currentUser, userPoints } = this.state;

    return threadList.edges.map(thread => {
      const comment = thread.node;

      return (
        <ParentThread
          currentUser={currentUser}
          key={comment.id}
          queryVariables={this.getQueryVariables()}
          setCommentingPrivileges={this.setCommentingPrivileges}
          setError={this.setError}
          thread={comment}
          userPoints={userPoints}
        />
      );
    });
  }

  render() {
    const { currentUser, sortBy, threads } = this.state;
    const { canComment } = currentUser;
    const hasComments = threads !== null && threads.edges.length > 0;

    return (
      <div>
        <Title>Discussions</Title>
        <CommentTextEditor addComment={this.addThread} canComment={canComment} />
        {!hasComments && <p>There are no comments to show.</p>}
        {hasComments && (
          <section>
            <CommentFilter>
              <Select
                small
                id="comment-filter"
                items={this.FILTERS}
                value={sortBy}
                onChange={this.handleFilterChange}
              />
            </CommentFilter>
            <CommentList>{this.renderThreads(threads)}</CommentList>
            {threads.hasNextPage && (
              <Button kind="text" xsmall onClick={() => this.loadMore(threads.endCursor)}>
                Load more comments...
              </Button>
            )}
          </section>
        )}
      </div>
    );
  }
}

const { func, object, string } = PropTypes;

CommentThread.propTypes = {
  addressDetails: object,
  ChallengeProof: object,
  client: object.isRequired,
  getAddressDetails: func.isRequired,
  getDaoProposalDetails: func.isRequired,
  proposalId: string.isRequired,
  rootCommentId: object,
  showHideAlert: func.isRequired,
  uid: string,
};

CommentThread.defaultProps = {
  addressDetails: {
    reputationPoint: 0,
    quarterPoint: 0,
  },

  ChallengeProof: undefined,
  rootCommentId: undefined,
  uid: '',
};

const mapStateToProps = ({ daoServer, infoServer }) => ({
  addressDetails: infoServer.AddressDetails.data,
  ChallengeProof: daoServer.ChallengeProof,
  rootCommentId: daoServer.ProposalDaoDetails,
});

export default withApollo(
  connect(
    mapStateToProps,
    {
      getAddressDetails,
      getDaoProposalDetails,
      showHideAlert,
    }
  )(CommentThread)
);
