import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ProposalForms from '@digix/gov-ui/pages/proposals/forms/index';
import { withFetchProposal } from '@digix/gov-ui/api/graphql-queries/proposal';

class EditProposal extends React.Component {
  render() {
    const {
      history,
      proposalDetails,
      Translations: {
        data,
        data: {
          common: { buttons },
          snackbar: { snackbars },
        },
      },
    } = this.props;

    return (
      <ProposalForms
        contractMethod="modifyProposal"
        data-digix="Edit-Proposal"
        history={history}
        ProposalDetails={proposalDetails}
        submitButtonLabel={buttons.updateNow}
        successMessage={snackbars.editProject.message}
        transactionTitle={snackbars.editProject.title}
        translations={data}
      />
    );
  }
}

const { object } = PropTypes;
EditProposal.propTypes = {
  proposalDetails: object.isRequired,
  history: object.isRequired,
  Translations: object.isRequired,
};

const mapStateToProps = state => ({
  Translations: state.daoServer.Translations,
});

export default withFetchProposal(connect(mapStateToProps)(EditProposal));
