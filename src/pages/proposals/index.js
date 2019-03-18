import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import _ from 'lodash';
import { connect } from 'react-redux';

import CommentThread from '@digix/gov-ui/pages/proposals/comment';
import Like from '@digix/gov-ui/components/common/elements/like';
import Milestones from '@digix/gov-ui/pages/proposals/milestones';
import ModeratorButtons from '@digix/gov-ui/pages/proposals/proposal-buttons/moderators';
import ParticipantButtons from '@digix/gov-ui/pages/proposals/proposal-buttons/participants';
import ProjectDetails from '@digix/gov-ui/pages/proposals/details';
import ProposalFundings from '@digix/gov-ui/pages/proposals/fundings';
import ProposalVersionNav from '@digix/gov-ui/pages/proposals/version-nav';
import SpecialProjectDetails from '@digix/gov-ui/pages/proposals/special-project-details';
import SpecialProjectVotingResult from '@digix/gov-ui/pages/proposals/special-project-voting-result';
import VotingAccordion from '@digix/gov-ui/components/common/elements/accordion/voting-accordion';
import VotingResult from '@digix/gov-ui/pages/proposals/voting-result';
import { Button } from '@digix/gov-ui/components/common/elements/index';
import { getAddressDetails } from '@digix/gov-ui/reducers/info-server/actions';
import { Message, Notifications } from '@digix/gov-ui/components/common/common-styles';
import { truncateNumber } from '@digix/gov-ui/utils/helpers';
import { withFetchProposal } from '@digix/gov-ui/api/graphql-queries/proposal';
import { withFetchUser } from '@digix/gov-ui/api/graphql-queries/users';

import {
  clearDaoProposalDetails,
  getUserProposalLikeStatus,
  likeProposal,
  unlikeProposal,
} from '@digix/gov-ui/reducers/dao-server/actions';

import {
  CallToAction,
  Data,
  FundingInfo,
  Header,
  InfoItem,
  ItemTitle,
  ProjectSummary,
  ProposalsWrapper,
  Title,
  WarningIcon,
} from '@digix/gov-ui/pages/proposals/style';

const getVotingStruct = proposal => {
  let deadline = Date.now();
  const mileStone = proposal.currentMilestone > 0 ? proposal.currentMilestone : 0;
  let votingStruct;
  switch (proposal.stage.toLowerCase()) {
    case 'draft':
      if (proposal.votingStage === 'draftVoting' && proposal.draftVoting !== null) {
        votingStruct = {
          yes: proposal.draftVoting.yes,
          no: proposal.draftVoting.no,
          quota: proposal.draftVoting.quota,
          quorum: proposal.draftVoting.quorum,
          claimed: proposal.draftVoting.claimed,
          deadline: proposal.draftVoting.votingDeadline,
        };
      }
      break;

    case 'proposal':
      if (Date.now() < proposal.votingRounds[0].commitDeadline) {
        deadline = proposal.votingRounds[0].commitDeadline || undefined;
      }
      deadline = proposal.votingRounds[0].revealDeadline;

      votingStruct = {
        yes: proposal.votingRounds[0].yes,
        no: proposal.votingRounds[0].no,
        quota: proposal.votingRounds[0].quota,
        claimed: proposal.votingRounds[0].claimed,
        quorum: proposal.votingRounds[0].quorum,
        deadline,
      };

      break;
    case 'review':
      if (Date.now() < proposal.votingRounds[mileStone].commitDeadline) {
        deadline = proposal.votingRounds[mileStone].commitDeadline || undefined;
      }
      deadline = proposal.votingRounds[mileStone].revealDeadline;

      votingStruct = {
        yes: proposal.votingRounds[mileStone].yes,
        no: proposal.votingRounds[mileStone].no,
        claimed: proposal.votingRounds[mileStone].claimed,
        quota: proposal.votingRounds[mileStone].quota,
        quorum: proposal.votingRounds[mileStone].quorum,
        deadline,
      };

      break;

    default:
      votingStruct = {
        yes: 0,
        no: 0,
        quota: 0,
        quorum: 0,
        claimed: true,
        deadline: undefined,
      };
      break;
  }
  return votingStruct;
};

class Proposal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      versions: undefined,
      currentVersion: 0,
    };

    const path = this.props.location.pathname.split('/');
    const proposalId = path[2];
    this.PROPOSAL_ID = proposalId;
  }

  componentWillMount = () => {
    const {
      challengeProof,
      clearDaoProposalDetailsAction,
      getAddressDetailsAction,
      history,
      location,
      addressDetails,
    } = this.props;
    if (!challengeProof.data) history.push('/');
    if (location.pathname) {
      clearDaoProposalDetailsAction();
      if (this.PROPOSAL_ID) {
        if (addressDetails.data.address) {
          getAddressDetailsAction(addressDetails.data.address);
        }
        this.getProposalLikes();
      }
    }
  };

  componentDidMount = () => {
    this.props.subscribeToProposal();
  };

  componentWillReceiveProps = nextProps => {
    const { proposalDetails } = nextProps;

    if (!proposalDetails.fetching && proposalDetails.data && proposalDetails.data.proposalId) {
      const currentVersion = proposalDetails.data.proposalVersions
        ? proposalDetails.data.proposalVersions.length - 1
        : 0;
      this.setState({
        versions: proposalDetails.data.proposalVersions,
        currentVersion,
      });
    }
  };

  shouldComponentUpdate = (nextProps, nextState) =>
    !_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state);

  getProposalLikes = () => {
    const { getUserProposalLikeStatusAction, challengeProof } = this.props;
    if (challengeProof.data) {
      getUserProposalLikeStatusAction({
        proposalId: this.PROPOSAL_ID,
        client: challengeProof.data.client,
        token: challengeProof.data['access-token'],
        uid: challengeProof.data.uid,
      });
    }
  };

  getChangedFundings() {
    const proposal = this.props.proposalDetails.data;
    let milestoneFunds = null;
    let milestoneFundDifference = null;
    let reward = null;
    let rewardDifference = null;

    if (!proposal.isFundingChanged) {
      return {
        milestoneFunds,
        milestoneFundDifference,
        reward,
        rewardDifference,
      };
    }

    const { finalReward, milestones } = proposal.changedFundings;
    milestoneFunds = milestones.reduce(
      (acc, milestone) => Number(acc.original) + Number(milestone.original)
    );

    const updatedMilestoneFunds = milestones.reduce(
      (acc, milestone) => Number(acc.updated) + Number(milestone.updated)
    );

    milestoneFundDifference = updatedMilestoneFunds - milestoneFunds;
    milestoneFundDifference =
      milestoneFundDifference === 0 ? undefined : truncateNumber(milestoneFundDifference);

    reward = truncateNumber(Number(finalReward.original));
    rewardDifference = Number(finalReward.updated) - Number(finalReward.original);
    rewardDifference = rewardDifference === 0 ? undefined : truncateNumber(rewardDifference);

    return {
      milestoneFunds,
      milestoneFundDifference,
      reward,
      rewardDifference,
    };
  }

  getPastVotingResults = () => {
    const { daoInfo, proposalDetails } = this.props;
    const pastVotes = [];
    if (proposalDetails.data.isSpecial === true) {
      pastVotes.push({
        title: 'Proposal Vote Results',
        voting: proposalDetails.data.votingRounds[0],
        daoInfo,
      });
    }

    if (proposalDetails.data.currentVotingRound === -1) {
      pastVotes.push({
        title: 'Moderator Approval Results',
        voting: proposalDetails.data.draftVoting,
        daoInfo,
      });
    }

    if (proposalDetails.data.currentVotingRound === 0) {
      pastVotes.push({
        title: 'Moderator Approval Results',
        voting: proposalDetails.data.draftVoting,
        daoInfo,
      });
      pastVotes.push({
        title: 'Proposal Vote Results',
        voting: proposalDetails.data.votingRounds[0],
        daoInfo,
      });
    }
    if (proposalDetails.data.currentVotingRound === 1) {
      pastVotes.push({
        title: 'Moderator Approval Results',
        voting: proposalDetails.data.draftVoting,
        daoInfo,
      });
      pastVotes.push({
        title: 'Proposal Vote Results',
        voting: proposalDetails.data.votingRounds[0],
        daoInfo,
      });
      pastVotes.push({
        title: 'Review Vote 1 Results',
        voting: proposalDetails.data.votingRounds[1],
        daoInfo,
      });
    }
    if (proposalDetails.data.currentVotingRound === 2) {
      pastVotes.push({
        title: 'Moderator Approval Results',
        voting: proposalDetails.data.draftVoting,
        daoInfo,
      });
      pastVotes.push({
        title: 'Proposal Vote Results',
        voting: proposalDetails.data.votingRounds[0],
        daoInfo,
      });
      pastVotes.push({
        title: 'Review Vote 1 Results',
        voting: proposalDetails.data.votingRounds[1],
        daoInfo,
      });
      pastVotes.push({
        title: 'Review Vote 2 Results',
        voting: proposalDetails.data.votingRounds[2],
        daoInfo,
      });
    }

    return pastVotes;
  };

  handlePreviousVersionClick = () => {
    this.setState({ currentVersion: Number(this.state.currentVersion) - 1 });
  };

  handleNextVersionClick = () => {
    this.setState({ currentVersion: Number(this.state.currentVersion) + 1 });
  };

  handleLikeClick = e => {
    e.preventDefault();
    const { likeProposalAction, challengeProof } = this.props;
    likeProposalAction({
      proposalId: this.PROPOSAL_ID,
      client: challengeProof.data.client,
      token: challengeProof.data['access-token'],
      uid: challengeProof.data.uid,
    });
  };

  handleUnlikeClick = e => {
    e.preventDefault();
    const { unlikeProposalAction, challengeProof } = this.props;
    unlikeProposalAction({
      proposalId: this.PROPOSAL_ID,
      client: challengeProof.data.client,
      token: challengeProof.data['access-token'],
      uid: challengeProof.data.uid,
    });
  };

  renderPrlAlert = prl =>
    prl ? (
      <Notifications warning withIcon>
        <WarningIcon kind="warning" />
        <Message note>
          This proposal can no longer claim funding due to Policy, Regulatory or Legal reasons, even
          if voting passes. Please contact us if you have any queries.
        </Message>
      </Notifications>
    ) : null;

  renderClaimApprovalAlert = () => {
    const {
      proposalDetails: {
        data: { proposer },
        data,
      },
      addressDetails: {
        data: { address: currentUser },
      },
      daoConfig,
    } = this.props;

    if (data.claimed) return null;

    const votingStruct = getVotingStruct(data);
    if (!votingStruct) return null;

    const voteClaimingDeadline = daoConfig.data.CONFIG_VOTE_CLAIMING_DEADLINE;
    const currentTime = Date.now();
    const { yes = 0, no = 0, quorum, quota } = votingStruct;
    const tentativePassed =
      Number(yes) + Number(no) > Number(quorum) &&
      Number(yes) / (Number(yes) + Number(no)) > Number(quota);
    const deadline = new Date((votingStruct.deadline + Number(voteClaimingDeadline)) * 1000);

    const pastDeadline = votingStruct && currentTime >= deadline;

    const canClaim =
      votingStruct &&
      tentativePassed &&
      !pastDeadline &&
      currentTime > votingStruct.deadline * 1000;

    if (canClaim && currentUser === proposer)
      return (
        <Notifications warning withIcon>
          <WarningIcon kind="warning" />
          <Message note>
            The voting result shows that your project passes the voting. Please click the button to
            send transaction(s) to claim this result on the blockchain. You need to do this action
            before {moment(deadline).format('MM/DD/YYYY hh:mm A')}, or your proposal will auto fail.
          </Message>
        </Notifications>
      );
    if (tentativePassed && pastDeadline && currentUser !== proposer)
      return (
        <Notifications warning withIcon>
          <WarningIcon kind="warning" small />
          <Message note>
            The voting result was not claimed before the claiming deadline. This project will be
            auto failed.
          </Message>
        </Notifications>
      );
  };

  renderProposerDidNotPassAlert = () => {
    const {
      proposalDetails: {
        data: { proposer },
        data,
      },
      addressDetails: {
        data: { address: currentUser },
      },
    } = this.props;

    const { daoConfig } = this.props;
    const votingStruct = getVotingStruct(data);
    if (!votingStruct) return null;
    const { yes, no, quorum, quota, claimed } = votingStruct;

    const currentTime = Date.now();

    const tentativePassed =
      Number(yes) + Number(no) > Number(quorum) &&
      Number(yes) / (Number(yes) + Number(no)) > Number(quota);

    const isVotingDeadlineOver = currentTime > new Date(votingStruct.deadline * 1000);
    const pastDeadline =
      votingStruct &&
      currentTime > votingStruct.deadline * 1000 &&
      currentTime >=
        new Date(
          (votingStruct.deadline + Number(daoConfig.data.CONFIG_VOTE_CLAIMING_DEADLINE)) * 1000
        );

    if (
      votingStruct &&
      !claimed &&
      ((!tentativePassed && isVotingDeadlineOver) || pastDeadline) &&
      currentUser === proposer
    )
      return (
        <Notifications warning withIcon>
          <WarningIcon kind="warning" />
          <Message note>
            Your project fails the voting, either by voting results or its already past the deadline
            for claiming voting results.
            {data.currentVotingRound <= 0
              ? ' Please click the button below to claim your failed project and get back your collateral.'
              : ''}
          </Message>
        </Notifications>
      );
    return null;
  };

  renderSpecialProposal = () => {
    const {
      proposalDetails,
      addressDetails,
      history,
      daoInfo,
      userProposalLike,
      userData,
    } = this.props;
    const isProposer = addressDetails.data.address === proposalDetails.data.proposer;
    const isForumAdmin = userData && userData.isForumAdmin;
    const liked = userProposalLike.data ? userProposalLike.data.liked : false;
    const likes = userProposalLike.data ? userProposalLike.data.likes : 0;
    const displayName = userProposalLike.data ? userProposalLike.data.user.displayName : '';

    return (
      <ProposalsWrapper>
        <ProjectSummary>
          {this.renderPrlAlert(proposalDetails.data.prl)}
          {this.renderClaimApprovalAlert()}
          {this.renderProposerDidNotPassAlert()}
          <Header>
            <div>
              <Button kind="tag" filled>
                Special
              </Button>
              <Button kind="tag" showIcon>
                {proposalDetails.data.stage}
              </Button>
              <Title>{proposalDetails.data.title}</Title>
            </div>
            {!isForumAdmin && (
              <CallToAction>
                <ParticipantButtons
                  isProposer={isProposer}
                  proposal={proposalDetails}
                  addressDetails={addressDetails}
                  match={this.props.match}
                  history={history}
                />
                <ModeratorButtons
                  proposal={proposalDetails}
                  addressDetails={addressDetails}
                  history={history}
                />
              </CallToAction>
            )}
          </Header>
          <FundingInfo>
            <InfoItem>
              <ItemTitle>Submitted By</ItemTitle>
              <Data>
                <span>{displayName}</span>
              </Data>
            </InfoItem>
            <InfoItem>
              <Like
                hasVoted={liked}
                likes={likes}
                onClick={liked ? this.handleUnlikeClick : this.handleLikeClick}
              />
            </InfoItem>
          </FundingInfo>
        </ProjectSummary>
        <VotingAccordion votingResults={this.getPastVotingResults()} />
        <SpecialProjectVotingResult proposal={proposalDetails.data} daoInfo={daoInfo} />
        <SpecialProjectDetails uintConfigs={proposalDetails.data.uintConfigs} />

        <CommentThread proposalId={this.PROPOSAL_ID} uid={addressDetails.data.address} />
      </ProposalsWrapper>
    );
  };

  renderNormalProposal = () => {
    const { currentVersion, versions } = this.state;
    const {
      addressDetails,
      daoInfo,
      history,
      match,
      proposalDetails,
      userProposalLike,
      userData,
    } = this.props;

    const proposal = proposalDetails.data;
    const { changedFundings } = proposal;

    const isProposer = addressDetails.data.address === proposal.proposer;
    const isForumAdmin = userData && userData.isForumAdmin;

    const proposalVersion = proposal.proposalVersions[currentVersion];
    const { dijixObject } = proposalVersion;

    const proposalLikes = userProposalLike.data;
    const liked = proposalLikes ? proposalLikes.liked : false;
    const likes = proposalLikes ? proposalLikes.likes : 0;
    const displayName = proposalLikes ? proposalLikes.user.displayName : '';

    return (
      <ProposalsWrapper>
        <ProjectSummary>
          <ProposalVersionNav
            currentVersion={currentVersion}
            handlePreviousVersionClick={this.handlePreviousVersionClick}
            handleNextVersionClick={this.handleNextVersionClick}
            match={match}
            versions={versions}
          />
          {this.renderPrlAlert(proposal.prl)}
          {this.renderClaimApprovalAlert()}
          {this.renderProposerDidNotPassAlert()}

          <Header>
            <div>
              <Button kind="tag" showIcon>
                {proposal.stage}
              </Button>
              <Title primary>{dijixObject.title}</Title>
            </div>
            {!isForumAdmin && (
              <CallToAction>
                <ParticipantButtons
                  isProposer={isProposer}
                  proposal={proposalDetails}
                  addressDetails={addressDetails}
                  match={this.props.match}
                  history={history}
                />
                <ModeratorButtons
                  proposal={proposalDetails}
                  addressDetails={addressDetails}
                  history={history}
                />
              </CallToAction>
            )}
          </Header>

          <FundingInfo>
            <InfoItem column>
              <ItemTitle>Submitted By</ItemTitle>
              <Data>
                <span>{displayName}</span>
              </Data>
            </InfoItem>

            <InfoItem outlined>
              <ItemTitle>Milestones</ItemTitle>
              <Data>
                <span data-digix="milestone-label">{dijixObject.milestones.length || 0}</span>
              </Data>
            </InfoItem>
            <ProposalFundings
              currentVersion={currentVersion}
              match={match}
              proposalDetails={proposal}
            />
            <InfoItem>
              <Like
                hasVoted={liked}
                likes={likes}
                onClick={liked ? this.handleUnlikeClick : this.handleLikeClick}
              />
            </InfoItem>
          </FundingInfo>
        </ProjectSummary>

        <VotingAccordion votingResults={this.getPastVotingResults()} />

        <VotingResult
          proposal={proposalDetails.data}
          draftVoting={proposalDetails.data.draftVoting}
          daoInfo={daoInfo}
        />

        <ProjectDetails project={dijixObject} />
        <Milestones
          milestones={dijixObject.milestones || []}
          milestoneFundings={proposalVersion.milestoneFundings || []}
          changedFundings={changedFundings ? changedFundings.milestones : undefined}
          fundingChanged={proposal.isFundingChanged}
        />
        <CommentThread proposalId={this.PROPOSAL_ID} uid={addressDetails.data.address} />
      </ProposalsWrapper>
    );
  };

  render() {
    const { proposalDetails } = this.props;
    if (proposalDetails.fetching === null || proposalDetails.fetching || !proposalDetails.data)
      return <div>Fetching Proposal Details</div>;

    if (proposalDetails.data.isSpecial) {
      return this.renderSpecialProposal();
    }
    return this.renderNormalProposal();
  }
}

const { object, func } = PropTypes;

Proposal.propTypes = {
  proposalDetails: object.isRequired,
  daoInfo: object.isRequired,
  subscribeToProposal: func.isRequired,
  getUserProposalLikeStatusAction: func.isRequired,
  clearDaoProposalDetailsAction: func.isRequired,
  getAddressDetailsAction: func.isRequired,
  likeProposalAction: func.isRequired,
  unlikeProposalAction: func.isRequired,
  addressDetails: object.isRequired,
  challengeProof: object,
  daoConfig: object.isRequired,
  userData: object,
  userProposalLike: object,
  location: object.isRequired,
  history: object.isRequired,
  match: object.isRequired,
};

Proposal.defaultProps = {
  challengeProof: undefined,
  userData: undefined,
  userProposalLike: undefined,
};

export default withFetchUser(
  connect(
    ({
      infoServer: {
        ProposalDetails,
        AddressDetails,
        DaoConfig,
        DaoDetails: { data },
      },
      daoServer: { ChallengeProof, UserProposalLike },
    }) => ({
      proposalDetails: ProposalDetails,
      addressDetails: AddressDetails,
      challengeProof: ChallengeProof,
      daoInfo: data,
      daoConfig: DaoConfig,
      userProposalLike: UserProposalLike,
    }),
    {
      getUserProposalLikeStatusAction: getUserProposalLikeStatus,
      getAddressDetailsAction: getAddressDetails,
      likeProposalAction: likeProposal,
      unlikeProposalAction: unlikeProposal,
      clearDaoProposalDetailsAction: clearDaoProposalDetails,
    }
  )(withFetchProposal(Proposal))
);
