import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import web3Connect from 'spectrum-lightsuite/src/helpers/web3/connect';
import { toBigNumber } from 'spectrum-lightsuite/src/helpers/stringUtils';

import SpectrumConfig from 'spectrum-lightsuite/spectrum.config';
import Dao from '@digix/dao-contracts/build/contracts/Dao.json';

import { registerUIs } from 'spectrum-lightsuite/src/helpers/uiRegistry';

import { Button } from '../../../components/common/elements/index';

import Details from '../forms/details';
import Milestones from '../forms/milestones';
import Multimedia from '../forms/multimedia';
import Overview from '../forms/overview';
import Preview from './preview';
import Confirm from '../confirm';

// import { sendTransactionToDaoServer } from '../../../reducers/dao-server/actions';
import { dijix } from '../../../utils/dijix';
import { encodeHash } from '../../../utils/helpers';

import getContract from '../../../utils/contracts';

import { DEFAULT_GAS, DEFAULT_GAS_PRICE } from '../../../constants';

import TxVisualization from '../../../components/common/blocks/tx-visualization';

import { showHideAlert } from '../../../reducers/gov-ui/actions';
import { sendTransactionToDaoServer } from '../../../reducers/dao-server/actions';

import { CreateWrapper, TabPanel, MenuItem, Header, LeftCol, RightCol, Heading } from './style';

registerUIs({ txVisualization: { component: TxVisualization } });

const network = SpectrumConfig.defaultNetworks[0];

const steps = [Overview, Details, Multimedia, Milestones];

class CreateProposal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      form: {},
      currentStep: 0,
      txHash: undefined,
      error: undefined,
      openError: false,
      canMoveNext: true,
      canMovePrevious: false,
      showPreview: false,
      showConfirmPage: false,
      validForm: false,
    };
  }

  onNextButtonClick = () => {
    const { currentStep } = this.state;
    const nextStep = currentStep + 1;
    if (nextStep < steps.length - 1) {
      this.setState({ currentStep: nextStep, canMovePrevious: true });
    } else if (nextStep === steps.length - 1) {
      this.setState({ currentStep: nextStep, canMoveNext: false, canMovePrevious: true });
    }
  };

  onPreviousButtonClick = () => {
    const { currentStep } = this.state;
    const prevStep = currentStep - 1;
    if (prevStep > 0) {
      this.setState({ currentStep: prevStep, canMoveNext: true });
    } else {
      this.setState({ currentStep: prevStep, canMoveNext: true, canMovePrevious: false });
    }
  };

  onChangeHandler = (e, value) => {
    const { form } = this.state;
    if (e.target && e.target.id) {
      form[e.target.id] = e.target.value;
    } else if (e && value) {
      form[e] = value;
    }

    const validForm = form.milestones && form.milestones.length > 0;

    this.setState({ form: { ...form }, validForm });
  };

  setError = error =>
    this.setState(
      {
        error: JSON.stringify((error && error.message) || error),
        openError: !!error,
      },
      () => {
        this.props.showHideAlert({ message: JSON.stringify((error && error.message) || error) });
      }
    );

  useStep = step => {
    this.setState({
      currentStep: step,
      canMovePrevious: step > 0,
      canMoveNext: step < steps.length - 1,
    });
  };

  createAttestation = () => {
    const { form } = this.state;
    const { title, description, details, milestones, proofs } = form;

    return dijix
      .create('attestation', {
        attestation: {
          title,
          description,
          details,
          milestones,
        },
        proofs: proofs ? [...proofs] : undefined,
      })
      .then(({ ipfsHash }) => {
        console.log(ipfsHash);
        const encodedHash = encodeHash(ipfsHash);
        return encodedHash;
      });
  };

  handleShowPreview = () => {
    this.setState({ showPreview: !this.state.showPreview });
  };

  handleShowConfirmPage = () => {
    this.setState({ showConfirmPage: !this.state.showConfirmPage });
  };

  handleSubmit = () => {
    const { web3Redux, ChallengeProof } = this.props;
    const { form } = this.state;
    const proposalEth = toBigNumber(2 * 1e18);
    const { milestones } = form;
    const funds = milestones.map(ms => toBigNumber(parseInt(ms.fund, 0) * 1e18));

    const { abi, address } = getContract(Dao, network);
    const contract = web3Redux
      .web3(network)
      .eth.contract(abi)
      .at(address);

    const ui = {
      caption: 'Requires 2 ETH to Submit Proposal',
      header: 'Proposal',
      type: 'txVisualization',
    };
    const web3Params = {
      gasPrice: DEFAULT_GAS_PRICE,
      gas: DEFAULT_GAS,
      value: proposalEth,
      ui,
    };

    this.createAttestation().then(ipfsHash => {
      contract.submitPreproposal
        .sendTransaction(
          ipfsHash,
          funds,
          toBigNumber(parseInt(form.finalReward, 0) * 1e18),
          web3Params
        )

        .then(txHash => {
          if (ChallengeProof.data) {
            this.setState({ txHash }, () => {
              Promise.all([
                this.props.sendTransactionToDaoServer({
                  txHash,
                  title: 'Submit Proposal',
                  token: ChallengeProof.data['access-token'],
                  client: ChallengeProof.data.client,
                  uid: ChallengeProof.data.uid,
                }),
                this.props.showHideAlert({ message: 'Proposal Submitted' }),
                this.props.history.push('/proposals'),
              ]);
            });
          }
        })
        .catch(this.setError);
    });
  };

  renderStep = () => {
    const { currentStep, form } = this.state;
    const Step = steps[currentStep];
    return <Step onChange={this.onChangeHandler} form={form} />;
  };

  renderPreview = () => {
    const { address } = this.props;
    return (
      <Preview
        form={this.state.form}
        onContinueEditing={this.handleShowPreview}
        proposer={address ? address.address : ''}
      />
    );
  };

  renderConfirmPage = () => (
    <Confirm
      form={this.state.form}
      onBack={this.handleShowConfirmPage}
      onSubmit={this.handleSubmit}
    />
  );

  renderCreate = () => {
    const { currentStep, canMoveNext, canMovePrevious, validForm } = this.state;
    return (
      <CreateWrapper>
        <TabPanel>
          <MenuItem active={currentStep === 0} onClick={() => this.useStep(0)}>
            Overview
          </MenuItem>
          <MenuItem active={currentStep === 1} onClick={() => this.useStep(1)}>
            Project Detail
          </MenuItem>
          <MenuItem active={currentStep === 2} onClick={() => this.useStep(2)}>
            Multimedia
          </MenuItem>
          <MenuItem active={currentStep === 3} onClick={() => this.useStep(3)}>
            Milestone
          </MenuItem>
        </TabPanel>
        <Header>
          <LeftCol>
            <Heading>Basic Project Information</Heading>
          </LeftCol>
          <RightCol>
            <Button secondary onClick={this.handleShowPreview}>
              Preview
            </Button>
            <Button disabled={!canMovePrevious} primary ghost onClick={this.onPreviousButtonClick}>
              Previous
            </Button>
            {canMoveNext && (
              <Button disabled={!canMoveNext} primary ghost onClick={this.onNextButtonClick}>
                Next
              </Button>
            )}
            {!canMoveNext &&
              validForm && (
                <Button primary ghost onClick={this.handleShowConfirmPage}>
                  Create Now
                </Button>
              )}
          </RightCol>
        </Header>
        {this.renderStep()}
      </CreateWrapper>
    );
  };
  render() {
    const { showPreview, showConfirmPage } = this.state;
    if (!showConfirmPage) {
      if (!showPreview) return this.renderCreate();
      if (showPreview) return this.renderPreview();
    }
    if (showConfirmPage) return this.renderConfirmPage();
  }
}

const { object, func } = PropTypes;
CreateProposal.propTypes = {
  web3Redux: object.isRequired,
  ChallengeProof: object.isRequired,
  showHideAlert: func.isRequired,
  sendTransactionToDaoServer: func.isRequired,
  address: object.isRequired,
  history: object.isRequired,
};

const mapStateToProps = state => ({
  ChallengeProof: state.daoServer.ChallengeProof,
  address: state.govUI.UserAddress,
});

export default web3Connect(
  connect(
    mapStateToProps,
    { showHideAlert, sendTransactionToDaoServer }
  )(CreateProposal)
);