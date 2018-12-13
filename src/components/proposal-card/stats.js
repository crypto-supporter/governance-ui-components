import React from 'react';
import PropTypes from 'prop-types';

import { toBigNumber, parseBigNumber } from 'spectrum-lightsuite/src/helpers/stringUtils';

import { StatsWrapper, Stats, StatItem } from '@digix/gov-ui/components/proposal-card/style';
import { VotingStages } from '@digix/gov-ui/constants';

export default class ProposalCardStats extends React.Component {
  getStats = proposal => {
    let approvalRating = 0;
    switch (proposal.votingStage) {
      case VotingStages.draftVoting: {
        if (proposal.currentVotingRound === -1) {
          approvalRating =
            parseBigNumber(proposal.draftVoting.yes, 0, false) > 0
              ? parseBigNumber(
                  toBigNumber(proposal.draftVoting.yes)
                    .div(toBigNumber(proposal.draftVoting.totalVoterStake))
                    .times(100),
                  0,
                  false
                )
              : 0;
        }
        return {
          approvalRating,
          participantCount: proposal.draftVoting ? proposal.draftVoting.totalVoterCount : 0,
        };
      }
      case VotingStages.commit:
      case VotingStages.reveal: {
        const { currentVotingRound } = proposal;
        approvalRating =
          parseBigNumber(proposal.votingRounds[currentVotingRound].yes, 0, false) > 0
            ? parseBigNumber(
                toBigNumber(proposal.votingRounds[currentVotingRound].yes)
                  .div(toBigNumber(proposal.votingRounds[currentVotingRound].totalVoterStake))
                  .times(100),
                0,
                false
              )
            : 0;
        return {
          approvalRating,
          participantCount: proposal.votingRounds[currentVotingRound].totalVoterCount || 0,
        };
      }
      default:
        return { approvalRating: 0, participantCount: 0 };
    }
  };
  render() {
    const { details } = this.props;
    if (!details) {
      return null;
    }

    // const { draftVoting } = details;

    // let approvalRating = 0;
    // if (draftVoting) {
    //   const totalVotes = parseBigNumber(draftVoting.totalVoterStake, 0, false);
    //   if (totalVotes) {
    //     const votedYes = parseBigNumber(draftVoting.yes, 0, false);
    //     approvalRating = ((votedYes * 100) / totalVotes).toFixed(2);
    //   }
    // }

    const { approvalRating, participantCount } = this.getStats(details);
    const funding = details.proposalVersions[0].totalFunding / 1e18;
    // const participantCount = draftVoting ? draftVoting.totalVoterCount : 0;

    return (
      <StatsWrapper>
        <Stats>
          <StatItem>
            Funding
            <span>{funding} ETH</span>
          </StatItem>
          <StatItem stage={details.stage}>
            Approval
            <span>{approvalRating}%</span>
          </StatItem>
          <StatItem>
            Participants
            <span>{participantCount}</span>
          </StatItem>
        </Stats>
      </StatsWrapper>
    );
  }
}
ProposalCardStats.propTypes = {
  details: PropTypes.object.isRequired,
};
