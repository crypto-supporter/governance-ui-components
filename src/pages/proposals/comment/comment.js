import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { Button, Icon } from '@digix/gov-ui/components/common/elements/index';
import { ActionBar, CommentPost } from '@digix/gov-ui/pages/proposals/comment/style';
import { CommentsApi } from '@digix/gov-ui/api/comments';
import { initializePayload } from '@digix/gov-ui/api';

class Comment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      comment: this.props.comment,
    };

    this.DELETE_MESSAGE = 'This message has been removed by the user.';
  }

  deleteComment() {
    const { comment } = this.state;
    const { ChallengeProof, setError } = this.props;

    comment.body = null;
    this.setState({ comment });

    if (ChallengeProof.data) {
      const payload = initializePayload(ChallengeProof);
      CommentsApi.delete(comment.id, payload).catch(() => {
        setError(CommentsApi.ERROR_MESSAGES.remove);
      });
    }
  }

  toggleLike = () => {
    const { comment } = this.state;
    const { ChallengeProof, setError } = this.props;

    comment.liked = !comment.liked;
    comment.likes = comment.liked ? comment.likes + 1 : comment.likes - 1;
    const request = comment.liked ? 'like' : 'unlike';
    this.setState({ comment });

    if (ChallengeProof.data) {
      const payload = initializePayload(ChallengeProof);
      CommentsApi[request](comment.id, payload).catch(() => {
        setError(CommentsApi.ERROR_MESSAGES[request]);
      });
    }
  };

  render() {
    const { toggleEditor, uid } = this.props;
    const { comment } = this.state;
    const { body, liked, user } = comment;
    const isAuthor = uid === user.address;

    return (
      <article className="comment">
        <CommentPost>
          {body || this.DELETE_MESSAGE}
          {body && (
            <ActionBar>
              <Button kind="text" xsmall onClick={() => toggleEditor()}>
                <Icon kind="reply" />
                <span>Reply</span>
              </Button>
              <Button kind="text" xsmall active={liked} onClick={() => this.toggleLike()}>
                <Icon active={liked} kind="like" />
                {liked && <span>Unlike</span>}
                {!liked && <span>Like</span>}
              </Button>
              {isAuthor && (
                <Button kind="text" xsmall onClick={() => this.deleteComment()}>
                  <Icon kind="trash" />
                  <span>Trash</span>
                </Button>
              )}
            </ActionBar>
          )}
        </CommentPost>
      </article>
    );
  }
}

const { func, object, string } = PropTypes;

Comment.propTypes = {
  comment: object.isRequired,
  ChallengeProof: object,
  setError: func.isRequired,
  toggleEditor: func,
  uid: string.isRequired,
};

Comment.defaultProps = {
  ChallengeProof: undefined,
  toggleEditor: undefined,
};

const mapStateToProps = state => ({
  ChallengeProof: state.daoServer.ChallengeProof,
});

export default connect(
  mapStateToProps,
  {}
)(Comment);