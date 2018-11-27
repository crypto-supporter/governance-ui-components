import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Dao from '@digix/dao-contracts/build/contracts/Dao.json';

import web3Connect from 'spectrum-lightsuite/src/helpers/web3/connect';
import SpectrumConfig from 'spectrum-lightsuite/spectrum.config';
import { registerUIs } from 'spectrum-lightsuite/src/helpers/uiRegistry';
import { getAddresses } from 'spectrum-lightsuite/src/selectors';
import { showTxSigningModal } from 'spectrum-lightsuite/src/actions/session';

import getContract from '@digix/gov-ui/utils/contracts';
import { executeContractFunction } from '@digix/gov-ui/utils/web3Helper';
import { ProposalStages, DEFAULT_GAS, DEFAULT_GAS_PRICE } from '@digix/gov-ui/constants';
import TxVisualization from '@digix/gov-ui/components/common/blocks/tx-visualization';
import { showHideAlert } from '@digix/gov-ui/reducers/gov-ui/actions';
import { sendTransactionToDaoServer } from '@digix/gov-ui/reducers/dao-server/actions';
import Button from '@digix/gov-ui/components/common/elements/buttons/index';

registerUIs({ txVisualization: { component: TxVisualization } });

const network = SpectrumConfig.defaultNetworks[0];

const emptyHash = '0x0000000000000000000000000000000000000000000000000000000000000000';

class FinalizeProjectButton extends React.PureComponent {
  setError = error =>
    this.props.showHideAlert({ message: JSON.stringify((error && error.message) || error) });

  handleSubmit = () => {
    const { web3Redux, ChallengeProof, addresses, proposalId } = this.props;

    const { abi, address } = getContract(Dao, network);
    const contract = web3Redux
      .web3(network)
      .eth.contract(abi)
      .at(address);

    const ui = {
      caption: 'Abort Proposal',
      header: 'Proposal',
      type: 'txVisualization',
    };
    const web3Params = {
      gasPrice: DEFAULT_GAS_PRICE,
      gas: DEFAULT_GAS,
      ui,
    };

    const sourceAddress = addresses.find(({ isDefault }) => isDefault);

    const onSuccess = txHash => {
      console.log(txHash);
      if (ChallengeProof.data) {
        this.props.sendTransactionToDaoServer({
          txHash,
          title: 'Finalize Proposal',
          token: ChallengeProof.data['access-token'],
          client: ChallengeProof.data.client,
          uid: ChallengeProof.data.uid,
        });
      }
    };

    const payload = {
      address: sourceAddress,
      contract,
      func: contract.finalizeProposal,
      params: proposalId,
      onSuccess: txHash => {
        onSuccess(txHash);
      },
      onFailure: this.setError,
      network,
      web3Params,
      ui,
      showTxSigningModal: this.props.showTxSigningModal,
    };
    return executeContractFunction(payload);
  };
  render() {
    const { stage, isProposer, finalVersionIpfsDoc } = this.props;
    if (stage !== ProposalStages.idea || !isProposer || finalVersionIpfsDoc !== emptyHash)
      return null;

    return (
      <Button kind="round" ghost primary onClick={this.handleSubmit}>
        Finalize
      </Button>
    );
  }
}

const { string, bool, object, func, array } = PropTypes;

FinalizeProjectButton.propTypes = {
  stage: string.isRequired,
  finalVersionIpfsDoc: string,
  proposalId: string.isRequired,
  isProposer: bool,
  web3Redux: object.isRequired,
  ChallengeProof: object.isRequired,
  showHideAlert: func.isRequired,
  sendTransactionToDaoServer: func.isRequired,
  showTxSigningModal: func.isRequired,
  addresses: array.isRequired,
};

FinalizeProjectButton.defaultProps = {
  isProposer: false,
  finalVersionIpfsDoc: emptyHash,
};

const mapStateToProps = state => ({
  ChallengeProof: state.daoServer.ChallengeProof,
  addresses: getAddresses(state),
});

export default web3Connect(
  connect(
    mapStateToProps,
    { showHideAlert, sendTransactionToDaoServer, showTxSigningModal }
  )(FinalizeProjectButton)
);