import React from 'react';
import PropTypes from 'prop-types';
import { H2 } from '../common/common-styles';
import { Button, Icon } from '../common/elements/index';

import {
  ProposaDetaillWrapper,
  ProposalCard,
  TagsContainer,
  Description,
  ProposalLink,
  ProposalFooter,
  PostedBy,
  PostedByLink,
} from './style';

export default class Proposal extends React.Component {
  render() {
    const { details, userDetails } = this.props;

    const proposalVersion = details.proposalVersions[details.proposalVersions.length - 1];
    const canCreate = userDetails && userDetails.data.isParticipant;

    return (
      <ProposaDetaillWrapper>
        <ProposalCard>
          <TagsContainer>
            <Button kind="flat" style={{ pointerEvents: 'none' }}>
              {details.stage}
            </Button>
          </TagsContainer>
          <Description>
            <H2>{proposalVersion.dijixObject.title}</H2>
            <p>{proposalVersion.dijixObject.description}</p>

            {canCreate ? (
              <ProposalLink
                href={`/proposals/${details.proposalId}`}
                to={`/proposals/${details.proposalId}`}
              >
                View Project
              </ProposalLink>
            ) : (
              <ProposalLink
                disabled
                href={`/proposals/${details.proposalId}`}
                to={`/proposals/${details.proposalId}`}
                style={{ pointerEvents: 'none' }}
              >
                View Project
              </ProposalLink>
            )}
          </Description>
          <ProposalFooter>
            <PostedBy>
              BY <PostedByLink style={{ pointerEvents: 'none' }}>{details.proposer}</PostedByLink>
            </PostedBy>

            <Button kind="text" xsmall>
              <Icon kind="like" />
              <span>Like</span>
            </Button>
          </ProposalFooter>
        </ProposalCard>
      </ProposaDetaillWrapper>
    );
  }
}

Proposal.propTypes = {
  details: PropTypes.object.isRequired,
  userDetails: PropTypes.object.isRequired,
};
