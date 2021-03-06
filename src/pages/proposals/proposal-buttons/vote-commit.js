import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Button from '@digix/gov-ui/components/common/elements/buttons/index';
import CommitVoteOverlay from '@digix/gov-ui/components/common/blocks/overlay/vote/commit';
import LogCommitVote from '@digix/gov-ui/analytics/commitVote';
import web3Connect from 'spectrum-lightsuite/src/helpers/web3/connect';
import { getUserStatus } from '@digix/gov-ui/utils/helpers';
import { showRightPanel } from '@digix/gov-ui/reducers/gov-ui/actions';
import { UserStatus, VotingStages } from '@digix/gov-ui/constants';

class CommitVoteButton extends React.PureComponent {
  showOverlay = hasVoted => {
    const {
      AddressDetails,
      history,
      proposalId,
      showRightPanelAction,
      proposal,
      translations,
      txnTranslations,
    } = this.props;

    const userType = getUserStatus(AddressDetails.data, UserStatus);
    if (hasVoted) {
      LogCommitVote.changeVote(userType);
    } else {
      LogCommitVote.initiate(userType);
    }

    showRightPanelAction({
      component: (
        <CommitVoteOverlay
          history={history}
          revoting={hasVoted}
          proposalId={proposalId}
          proposal={proposal}
          translations={translations}
          txnTranslations={txnTranslations}
        />
      ),
      show: true,
    });
  };

  render() {
    const {
      isParticipant,
      proposal,
      proposal: { currentVotingRound, isSpecial, isActive },
      votes,
      translations: { buttons },
    } = this.props;

    const vote = votes ? votes[proposal.proposalId] : undefined;
    const votingRound = vote ? vote.votingRound[currentVotingRound || 0] : undefined;
    const hasVoted = votingRound ? votingRound.commit : false;

    if (
      !isParticipant ||
      (!proposal.draftVoting && !isSpecial) ||
      (!isActive && isSpecial) ||
      (proposal.votingStage !== VotingStages.commit && !isSpecial)
    ) {
      return null;
    }

    const currentTime = Date.now();
    const withinDeadline =
      currentTime <
        proposal.votingRounds[isSpecial ? 0 : currentVotingRound].commitDeadline * 1000 &&
      currentTime > proposal.votingRounds[isSpecial ? 0 : currentVotingRound].startTime * 1000;

    if (!withinDeadline) return null;

    return (
      <Button kind="round" large onClick={() => this.showOverlay(hasVoted)}>
        {hasVoted ? buttons.changeVote : buttons.vote}
      </Button>
    );
  }
}

const { bool, func, object, string } = PropTypes;

CommitVoteButton.propTypes = {
  AddressDetails: object.isRequired,
  isParticipant: bool,
  proposal: object.isRequired,
  proposalId: string.isRequired,
  history: object.isRequired,
  showRightPanelAction: func.isRequired,
  votes: object,
  translations: object.isRequired,
  txnTranslations: object.isRequired,
};

CommitVoteButton.defaultProps = {
  isParticipant: false,
  votes: undefined,
};

const mapStateToProps = state => ({
  AddressDetails: state.infoServer.AddressDetails,
});

export default web3Connect(
  connect(
    mapStateToProps,
    {
      showRightPanelAction: showRightPanel,
    }
  )(CommitVoteButton)
);
