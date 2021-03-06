import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Dao from '@digix/dao-contracts/build/contracts/Dao.json';
import getContract from '@digix/gov-ui/utils/contracts';
import web3Connect from 'spectrum-lightsuite/src/helpers/web3/connect';
import SpectrumConfig from 'spectrum-lightsuite/spectrum.config';
import TxVisualization from '@digix/gov-ui/components/common/blocks/tx-visualization';
import { Button } from '@digix/gov-ui/components/common/elements/index';
import { DEFAULT_GAS_PRICE } from '@digix/gov-ui/constants';
import { dijix } from '@digix/gov-ui/utils/dijix';
import { encodeHash, hasInvalidLink, injectTranslation } from '@digix/gov-ui/utils/helpers';
import { executeContractFunction } from '@digix/gov-ui/utils/web3Helper';
import { getAddresses } from 'spectrum-lightsuite/src/selectors';
import { getDaoConfig } from '@digix/gov-ui/reducers/info-server/actions';
import { registerUIs } from 'spectrum-lightsuite/src/helpers/uiRegistry';
import { sendTransactionToDaoServer } from '@digix/gov-ui/reducers/dao-server/actions';
import { showHideAlert } from '@digix/gov-ui/reducers/gov-ui/actions';
import { showTxSigningModal } from 'spectrum-lightsuite/src/actions/session';
import { toBigNumber } from 'spectrum-lightsuite/src/helpers/stringUtils';

import Confirm from '@digix/gov-ui/pages/proposals/confirm';
import Details from '@digix/gov-ui/pages/proposals/forms/details';
import Milestones from '@digix/gov-ui/pages/proposals/forms/milestones';
import Multimedia from '@digix/gov-ui/pages/proposals/forms/multimedia';
import Overview from '@digix/gov-ui/pages/proposals/forms/overview';
import Preview from '@digix/gov-ui/pages/proposals/forms/preview';

import Spinner from '@digix/gov-ui/components/common/blocks/loader/spinner';

import {
  CallToAction,
  CreateWrapper,
  Heading,
  Header,
  MenuItem,
  TabPanel,
} from '@digix/gov-ui/pages/proposals/forms/base-style';

const network = SpectrumConfig.defaultNetworks[0];
registerUIs({ txVisualization: { component: TxVisualization } });

class ProposalForms extends React.Component {
  constructor(props) {
    super(props);
    this.RENDER_STEP = {
      form: 1,
      confirm: 2,
      loader: 3,
      preview: 4,
    };

    this.state = {
      canMoveNext: true,
      canMovePrevious: false,
      currentStep: 0,
      exceedsLimit: false,
      form: {},
      formErrors: {},
      proposalId: 0,
      renderStep: this.RENDER_STEP.form,
      validForm: false,
    };

    this.FORM_STEPS = [Overview, Details, Multimedia, Milestones];
    this.MAX_FORM_STEP_INDEX = this.FORM_STEPS.length - 1;
    this.NON_EMPTY_STRING = /^(?!\s*$).+/;
    this.EMPTY_HTML = /^((<p>)((<br>)*|(\s*)|)*(<\/p>))*$/;
  }

  // will only trigger for Edit Project
  componentWillMount() {
    if (!this.props.ProposalDetails) {
      return;
    }

    const { ChallengeProof } = this.props;
    const proposal = this.props.ProposalDetails.data;
    const { proposalId, proposalVersions } = proposal;

    if (!ChallengeProof.data || !proposalId) {
      this.props.history.push('/');
    }

    const currentVersion = proposalVersions ? proposalVersions[proposalVersions.length - 1] : {};
    const form = { ...currentVersion.dijixObject };

    this.setState({
      form: { ...form },
      proposalId,
      validForm: form.title && form.description,
    });
  }

  componentDidMount() {
    this.props.getDaoConfig();
  }

  onPreviousButtonClick = () => {
    let { canMovePrevious } = this.state;
    const { currentStep } = this.state;
    const prevStep = currentStep - 1;

    if (prevStep === 0) {
      canMovePrevious = false;
    }

    this.setState({
      canMoveNext: true,
      canMovePrevious,
      currentStep: prevStep,
      formErrors: {},
      validForm: true,
    });
  };

  onNextButtonClick = () => {
    let { canMoveNext } = this.state;
    const { currentStep, form } = this.state;
    const nextStep = currentStep + 1;

    if (nextStep === this.MAX_FORM_STEP_INDEX) {
      canMoveNext = false;
    }

    if (currentStep === 0) {
      form.title = form.title.trim();
      form.description = form.description.trim();
    }

    this.setState(
      {
        canMoveNext,
        canMovePrevious: true,
        currentStep: nextStep,
        form: { ...form },
        formErrors: {},
      },
      () => this.validateForm(null, null, true)
    );
  };

  onFormInput = (e, details, validateFormItems, fieldChanged, index) => {
    const { form } = this.state;
    let key = e;
    let value = details;

    if (e.target) {
      key = e.target.id;
      value = e.target.value; // eslint-disable-line
    }

    form[key] = value;
    this.setState({ form: { ...form } }, () => {
      this.validateForm(key, value, validateFormItems, fieldChanged, index);
    });
  };

  setError = error => {
    if (!error) return;
    this.setState({
      renderStep: this.RENDER_STEP.confirm,
    });
    const message = JSON.stringify(error && error.message) || error;
    this.props.showHideAlert({ message });
  };

  hasErrors = formErrors => Object.values(formErrors).filter(e => !!e).length > 0;

  validateOverviewForm(field, value, validateOnChangeForm) {
    const { description, title } = this.state.form;
    let { formErrors } = this.state;

    const hasDescription = description && this.NON_EMPTY_STRING.test(description);
    const hasTitle = title && this.NON_EMPTY_STRING.test(title);

    // do not pass formErrors if validation is due to switching forms
    // if validation is due to user input, only update formErrors for the current input
    if (validateOnChangeForm) {
      formErrors = {};
    } else if (field && field === 'description') {
      formErrors.invalidDescription = !hasDescription;
      formErrors.invalidLink = value && hasInvalidLink(value);
    } else if (field && field === 'title') {
      formErrors.invalidTitle = !hasTitle;
    }
    const validForm = hasDescription && hasTitle && !this.hasErrors(formErrors);
    this.setState({
      formErrors,
      validForm,
    });
  }

  validateProjectDetailForm(validateOnChangeForm) {
    let { formErrors } = this.state;
    const { details } = this.state.form;
    const hasDetails = details && details !== '' && !this.EMPTY_HTML.test(details);

    if (validateOnChangeForm) {
      formErrors = {};
    } else {
      formErrors.invalidDetails = !hasDetails;
      formErrors.invalidLink = details && hasInvalidLink(details);
    }

    const validForm = hasDetails && !this.hasErrors(formErrors);
    this.setState({
      formErrors,
      validForm,
    });
  }

  validateMilestoneForm(field, validateForItems, fieldChanged, milestoneIndex) {
    const { form, formErrors } = this.state;
    const { finalReward } = form;
    let { milestones } = form;
    const config = this.props.DaoConfig.data;

    const { isDigix } = this.props;

    if (!milestones) {
      milestones = [];
    }

    const totalFunds = this.computeTotalFunds();
    const milestoneFundsLimit = config.CONFIG_MAX_FUNDING_FOR_NON_DIGIX;
    const exceedsLimit = isDigix ? false : totalFunds > Number(milestoneFundsLimit);

    const hasReward = finalReward && Number(finalReward) > 0;
    const hasMilestones = milestones.length > 0;
    const hasMissingFunds = milestones.filter(m => !m.fund || m.fund === '').length > 0;
    const milestonesWithInvalidDescriptions = milestones.filter(
      ({ description }) =>
        !description ||
        description === '' ||
        this.EMPTY_HTML.test(description) ||
        hasInvalidLink(description)
    );
    const hasInvalidDescription = milestonesWithInvalidDescriptions.length > 0;

    formErrors.milestones = {};
    if (field === 'finalReward') {
      formErrors.invalidReward = !hasReward;
    }

    if (validateForItems && milestones[milestoneIndex]) {
      const { fund, description } = milestones[milestoneIndex];
      const invalidFunds = !fund || fund === '';
      const invalidDescription =
        !description || description === '' || this.EMPTY_HTML.test(description);

      formErrors.milestones[milestoneIndex] = {
        invalidFunds: fieldChanged === 'fund' && invalidFunds,
        invalidDescription: fieldChanged === 'description' && invalidDescription,
        invalidLink: fieldChanged === 'description' && hasInvalidLink(description),
      };
    }

    const validForm =
      hasReward && hasMilestones && !hasMissingFunds && !hasInvalidDescription && !exceedsLimit;

    this.setState({
      exceedsLimit,
      formErrors,
      validForm,
    });
  }

  computeTotalFunds() {
    const { form } = this.state;
    const { finalReward, milestones } = form;

    if (!milestones) {
      const funds = finalReward ? Number(finalReward) : 0;
      return funds;
    }

    const milestoneFunds = (acc, currentValue) => acc + Number(currentValue.fund);
    return Number(milestones.reduce(milestoneFunds, 0)) + Number(finalReward);
  }

  validateForm(field, value, validateFormItems, fieldChanged, index) {
    const { currentStep } = this.state;

    switch (currentStep) {
      case 0:
        this.validateOverviewForm(field, value, validateFormItems);
        break;
      case 1:
        this.validateProjectDetailForm(validateFormItems);
        break;
      case 2:
        // no validations need for file upload
        this.setState({ validForm: true });
        break;
      case 3:
        this.validateMilestoneForm(field, validateFormItems, fieldChanged, index);
        break;
      default:
        this.setState({ validForm: false });
    }
  }

  createAttestation() {
    const {
      description,
      details,
      finalReward,
      images,
      milestones,
      proofs,
      title,
    } = this.state.form;
    const { contractMethod } = this.props;

    let proposalProofs = proofs && proofs.length > 0 ? [...proofs] : undefined;
    if (contractMethod === 'modifyProposal') {
      proposalProofs = images && images[0] !== null ? images.concat(proofs) : proofs;
    }

    return dijix
      .create('attestation', {
        attestation: {
          description,
          details,
          finalReward,
          milestones,
          title,
        },
        proofs: proposalProofs,
      })
      .then(({ ipfsHash }) => encodeHash(ipfsHash));
  }

  submit = () => {
    this.setState({
      renderStep: this.RENDER_STEP.loader,
    });

    const {
      addresses,
      ChallengeProof,
      contractMethod,
      gasLimitConfig,
      successMessage,
      transactionTitle,
      web3Redux,
      translations: {
        snackbar: { snackbars },
        project,
      },
    } = this.props;

    const { proposalId } = this.state;
    const { finalReward, milestones } = this.state.form;
    const config = this.props.DaoConfig.data;

    const sourceAddress = addresses.find(({ isDefault }) => isDefault);
    const funds = milestones.map(ms => toBigNumber(ms.fund).times(toBigNumber(1e18)));
    const reward = toBigNumber(finalReward).times(toBigNumber(1e18));
    const preProposalCollateral = Number(config.CONFIG_PREPROPOSAL_COLLATERAL);

    const { abi, address } = getContract(Dao, network);
    const contract = web3Redux
      .web3(network)
      .eth.contract(abi)
      .at(address);

    let caption = injectTranslation(project.collateral, {
      preProposalCollateral,
    });

    if (contractMethod === 'modifyProposal') {
      caption = transactionTitle;
    }

    const ui = {
      caption,
      header: snackbars.createProject.txUiHeader,
      type: 'txVisualization',
    };

    let value;
    if (contractMethod !== 'modifyProposal') {
      value = toBigNumber(preProposalCollateral * 1e18);
    }

    const gasLimit =
      contractMethod !== 'modifyProposal'
        ? gasLimitConfig.EDIT_PROPOSAL
        : gasLimitConfig.CREATE_PROPOSAL;

    const web3Params = {
      gasPrice: DEFAULT_GAS_PRICE,
      gas: gasLimit || gasLimitConfig.DEFAULT,
      value,
      ui,
    };

    const onTransactionAttempt = txHash => {
      this.setState({ renderStep: this.RENDER_STEP.confirm });

      if (ChallengeProof.data) {
        this.props.sendTransactionToDaoServer({
          txHash,
          title: transactionTitle,
          token: ChallengeProof.data['access-token'],
          client: ChallengeProof.data.client,
          uid: ChallengeProof.data.uid,
        });
      }
    };

    const onTransactionSuccess = txHash => {
      this.props.showHideAlert({
        message: successMessage,
        txHash,
      });

      this.props.history.push('/');
    };

    this.setError();
    this.createAttestation().then(ipfsHash => {
      const params = [ipfsHash, funds, reward, web3Params];
      if (contractMethod === 'modifyProposal') {
        params.unshift(proposalId);
      }

      const payload = {
        address: sourceAddress,
        contract,
        func: contract[contractMethod],
        params,
        onFailure: this.setError,
        onFinally: txHash => onTransactionAttempt(txHash),
        onSuccess: txHash => onTransactionSuccess(txHash),
        network,
        web3Params,
        ui,
        showTxSigningModal: this.props.showTxSigningModal,
        translations: this.props.translations.signTransaction,
      };

      return executeContractFunction(payload);
    });
  };

  showForm = () => {
    this.setState({
      renderStep: this.RENDER_STEP.form,
    });
  };

  showPreview = () => {
    this.setState({
      renderStep: this.RENDER_STEP.preview,
    });
  };

  showConfirmPage = () => {
    this.setState({
      renderStep: this.RENDER_STEP.confirm,
    });
  };

  _renderTabPanel() {
    const { currentStep } = this.state;
    const {
      translations: { project },
    } = this.props;
    return (
      <TabPanel>
        <MenuItem active={currentStep === 0}>{project.overview}</MenuItem>
        <MenuItem active={currentStep === 1}>{project.projectDetail}</MenuItem>
        <MenuItem active={currentStep === 2}>{project.multimedia}</MenuItem>
        <MenuItem active={currentStep === 3}>{project.milestone}</MenuItem>
      </TabPanel>
    );
  }

  _renderNavButtons() {
    const { canMoveNext, canMovePrevious, validForm } = this.state;
    const {
      dataDigixPrefix,
      submitButtonLabel,
      translations: {
        common: { buttons },
      },
    } = this.props;

    return (
      <CallToAction>
        <Button tertiary onClick={this.showPreview} data-digix={`${dataDigixPrefix}-Preview`}>
          {buttons.preview}
        </Button>

        {canMovePrevious && (
          <Button
            primary
            onClick={this.onPreviousButtonClick}
            data-digix={`${dataDigixPrefix}-Previous`}
          >
            {buttons.previous}
          </Button>
        )}

        {canMoveNext && (
          <Button
            primary
            disabled={!validForm}
            onClick={this.onNextButtonClick}
            data-digix={`${dataDigixPrefix}-Next`}
          >
            {buttons.next}
          </Button>
        )}

        {!canMoveNext && (
          <Button
            primary
            ghost
            disabled={!validForm}
            onClick={this.showConfirmPage}
            data-digix={`${dataDigixPrefix}-Button`}
          >
            {submitButtonLabel}
          </Button>
        )}
      </CallToAction>
    );
  }

  _renderStep() {
    const { currentStep, exceedsLimit, form, formErrors } = this.state;
    const { isDigix } = this.props;
    const Step = this.FORM_STEPS[currentStep];

    return (
      <Step
        daoConfig={this.props.DaoConfig}
        errors={formErrors}
        exceedsLimit={exceedsLimit}
        form={form}
        onChange={this.onFormInput}
        translations={this.props.translations}
        isDigix={isDigix}
      />
    );
  }

  renderForm() {
    const {
      translations: { project },
    } = this.props;
    return (
      <CreateWrapper>
        {this._renderTabPanel()}
        <Header>
          <Heading>{project.basicProjectInformation}</Heading>
          {this._renderNavButtons()}
        </Header>

        {this._renderStep()}
      </CreateWrapper>
    );
  }

  renderPreview() {
    const { addresses, translations } = this.props;
    const sourceAddress = addresses.find(({ isDefault }) => isDefault);
    const proposer = sourceAddress.address || '';

    return (
      <Preview
        translations={translations}
        form={this.state.form}
        proposer={proposer}
        onContinueEditing={this.showForm}
      />
    );
  }

  renderConfirmPage() {
    return (
      <Confirm
        translations={this.props.translations}
        form={this.state.form}
        onBack={this.showForm}
        onSubmit={this.submit}
      />
    );
  }

  render() {
    const { renderStep } = this.state;

    switch (renderStep) {
      case this.RENDER_STEP.form:
        return this.renderForm();
      case this.RENDER_STEP.preview:
        return this.renderPreview();
      case this.RENDER_STEP.confirm:
        return this.renderConfirmPage();
      case this.RENDER_STEP.loader:
        return <Spinner translations={this.props.translations} />;
      default:
        return this.renderForm();
    }
  }
}

const { array, func, object, string, bool } = PropTypes;
ProposalForms.propTypes = {
  addresses: array,
  ChallengeProof: object.isRequired,
  contractMethod: string.isRequired,
  DaoConfig: object.isRequired,
  dataDigixPrefix: string.isRequired,
  getDaoConfig: func.isRequired,
  gasLimitConfig: object.isRequired,
  history: object.isRequired,
  ProposalDetails: object,
  sendTransactionToDaoServer: func.isRequired,
  showHideAlert: func.isRequired,
  showTxSigningModal: func.isRequired,
  submitButtonLabel: string.isRequired,
  successMessage: string.isRequired,
  transactionTitle: string.isRequired,
  web3Redux: object.isRequired,
  translations: object.isRequired,
  isDigix: bool,
};

ProposalForms.defaultProps = {
  addresses: undefined,
  ProposalDetails: undefined,
  isDigix: false,
};

const mapStateToProps = state => ({
  addresses: getAddresses(state),
  ChallengeProof: state.daoServer.ChallengeProof,
  DaoConfig: state.infoServer.DaoConfig,
  gasLimitConfig: state.infoServer.TxConfig.data.gas,
});

export default web3Connect(
  connect(
    mapStateToProps,
    {
      getDaoConfig,
      sendTransactionToDaoServer,
      showHideAlert,
      showTxSigningModal,
    }
  )(ProposalForms)
);
