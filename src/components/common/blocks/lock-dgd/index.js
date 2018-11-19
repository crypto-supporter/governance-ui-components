import React from 'react';
import { connect } from 'react-redux';
import web3Connect from 'spectrum-lightsuite/src/helpers/web3/connect';

import PropTypes from 'prop-types';

import DaoStakeLocking from '@digix/dao-contracts/build/contracts/DaoStakeLocking.json';

import { showTxSigningModal } from 'spectrum-lightsuite/src/actions/session';
import { getDefaultAddress, getDefaultNetworks } from 'spectrum-lightsuite/src/selectors';
import { registerUIs } from 'spectrum-lightsuite/src/helpers/uiRegistry';

import SpectrumConfig from 'spectrum-lightsuite/spectrum.config';
// import sanitizeData from 'spectrum-lightsuite/src/helpers/txUtils';

import { showHideLockDgdOverlay, showHideAlert } from '../../../../reducers/gov-ui/actions';
import { sendTransactionToDaoServer } from '../../../../reducers/dao-server/actions';

import TextField from '../../elements/textfield';

import Button from '../../../common/elements/buttons';

import getContract from '../../../../utils/contracts';

import { DEFAULT_GAS, DEFAULT_GAS_PRICE } from '../../../../constants';

import {
  Container,
  TransparentOverlay,
  WalletContainer,
  CloseButton,
  Header,
  LockDgdBox,
  InputDgxBox,
  TextCaption,
  StakeCaption,
  ErrorCaption,
  ConfirmationBox,
} from './style';
import Icon from '../../../common/elements/icons';

import LockDgdTx from './tx-ui';

const network = SpectrumConfig.defaultNetworks[0];

registerUIs({ lockDgd: { component: LockDgdTx } });

const etherscanUrl =
  network === 'eth-mainnet' ? 'https://etherscan.io/tx/' : 'https://kovan.etherscan.io/tx/';

class LockDgd extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dgd: 0,
      error: '',
      openError: false,
      gasPrice: 30,
      txHash: undefined,
      // txFee: 0,
    };
  }
  componentWillMount = () => {
    const { lockDgdOverlay } = this.props;
    if (!lockDgdOverlay || !lockDgdOverlay.show) {
      document.body.classList.remove('modal-is-open');
    } else {
      document.body.classList.toggle('modal-is-open');
    }
  };

  onDgdInputChange = e => {
    const { value } = e.target;
    this.setState({ dgd: value });
  };

  setError = error =>
    this.setState({
      error: JSON.stringify((error && error.message) || error),
      openError: !!error,
    });

  handleCloseLockDgd = () => {
    this.setState({ txHash: undefined }, () => {
      this.props.showHideLockDgdOverlay(false);
    });
  };

  handleButtonClick = () => {
    const {
      web3Redux,
      defaultAddress,
      sendTransactionToDaoServer: sendTransactionToDaoServerAction,
      ChallengeProof,
    } = this.props;
    const { dgd, gasPrice } = this.state;
    const { abi, address } = getContract(DaoStakeLocking, network);
    const contract = web3Redux
      .web3(network)
      .eth.contract(abi)
      .at(address);

    // const userAddress = addresses.find(a => a.address === defaultAddress.address);
    // const userAddress = defaultAddress.address;
    // const {
    //   keystore: {
    //     type: { id: keystoreType },
    //   },
    // } = userAddress;

    const web3Params = { gasPrice: DEFAULT_GAS_PRICE, gas: DEFAULT_GAS };

    const ui = {
      dgd,
      type: 'lockDgd',
    };

    this.setError();

    // if (keystoreType === 'metamask' || keystoreType === 'imtoken') {
    //   const selectedNetwork = networks.find(({ id }) => id === network);
    //   const data = contract.vote.getData([correctDgxReward, minDgd]);
    //   return this.props
    //     .showTxSigningModal({
    //       address: userAddress,
    //       network: selectedNetwork,
    //       txData: sanitizeData(
    //         {
    //           ...web3Params,
    //           from: defaultAddress.address,
    //           data,
    //           to: contract.address,
    //         },
    //         selectedNetwork
    //       ),
    //       ui,
    //     })
    //     .then(txHash => {
    //       console.log(txHash);
    //       // this.setState({ txHash, openTracker: true, broadcast: new Date() });
    //     })
    //     .catch(this.setError);
    // }

    return contract.lockDGD
      .sendTransaction(dgd * 1e9, {
        from: defaultAddress.address,
        ui,
        ...web3Params,
      })
      .then(txHash => {
        if (ChallengeProof.data) {
          this.setState({ txHash }, () => {
            sendTransactionToDaoServerAction({
              txHash,
              title: 'Lock DGD',
              token: ChallengeProof.data['access-token'],
              client: ChallengeProof.data.client,
              uid: ChallengeProof.data.uid,
            });
          });
        } else {
          this.setState({ txHash }, () => {
            this.props.showHideAlert({ message: txHash });
          });
        }
      })
      .catch(this.setError);
  };

  renderConfirmation = () => {
    const { txHash } = this.state;
    return (
      <WalletContainer>
        <CloseButton>
          <Header>CONFIRMATION</Header>
          <Icon kind="close" onClick={this.handleCloseLockDgd} />
        </CloseButton>
        <ConfirmationBox>
          <h2>Congratulations!</h2>
          <div>
            You now have voting power in DigixDAO. With great power comes great responsibility.
          </div>
          <div>
            Want to check transaction? Click{' '}
            <a href={`${etherscanUrl}${txHash}`} target="_blank" rel="noopener noreferrer">
              here
            </a>
            .
          </div>
        </ConfirmationBox>

        <Button
          kind="round"
          primary
          ghost
          fluid
          onClick={this.handleCloseLockDgd}
          style={{ marginTop: '4rem' }}
        >
          Get Started
        </Button>
      </WalletContainer>
    );
  };

  renderLockDgd = () => {
    const { dgd, openError, error } = this.state;
    return (
      <WalletContainer>
        <CloseButton>
          <Header>LOCK DGD</Header>
          <Icon kind="close" onClick={() => this.props.showHideLockDgdOverlay(false)} />
        </CloseButton>
        <LockDgdBox>You are now locking DGD in the staking Phase</LockDgdBox>
        <TextCaption>
          <strong>Please enter the amount of DGD you wish to lock in:</strong>
        </TextCaption>
        <InputDgxBox>
          <TextField type="number" autoFocus onChange={this.onDgdInputChange} />
          DGD
        </InputDgxBox>
        {dgd > 0 && <StakeCaption>This will give you {dgd} STAKE in DigixDAO</StakeCaption>}
        <Button
          kind="round"
          primary
          ghost
          fluid
          onClick={this.handleButtonClick}
          disabled={!dgd && dgd <= 0}
          style={{ marginTop: '4rem' }}
        >
          Lock DGD
        </Button>
        {openError && <ErrorCaption>{error}</ErrorCaption>}
      </WalletContainer>
    );
  };

  render() {
    const { txHash } = this.state;
    const { lockDgdOverlay } = this.props;
    if (!lockDgdOverlay || !lockDgdOverlay.show) return null;
    return (
      <Container>
        <TransparentOverlay />
        {!txHash && this.renderLockDgd()}
        {txHash && this.renderConfirmation()}
      </Container>
    );
  }
}

const { object, func } = PropTypes;

LockDgd.propTypes = {
  lockDgdOverlay: object.isRequired,
  // showTxSigningModal: func.isRequired,
  showHideLockDgdOverlay: func.isRequired,
  sendTransactionToDaoServer: func.isRequired,
  web3Redux: object.isRequired,
  ChallengeProof: object.isRequired,
  defaultAddress: object,
  showHideAlert: func.isRequired,
};

LockDgd.defaultProps = {
  defaultAddress: undefined,
};
const mapStateToProps = state => ({
  // networks: getNetworks(state),
  defaultAddress: getDefaultAddress(state),
  networks: getDefaultNetworks(state),
  AddressDetails: state.infoServer.AddressDetails,
  Challenge: state.daoServer.Challenge,
  ChallengeProof: state.daoServer.ChallengeProof,
  lockDgdOverlay: state.govUI.LockDgdOverlay,
});

export default web3Connect(
  connect(
    mapStateToProps,
    {
      showTxSigningModal,
      showHideLockDgdOverlay,
      sendTransactionToDaoServer,
      showHideAlert,
    }
  )(LockDgd)
);
