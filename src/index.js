import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import _ from 'lodash';

import { HashRouter, Switch, Route, Redirect } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

import registerReducers from 'spectrum-lightsuite/src/helpers/registerReducers';

import '@digix/gov-ui/global-styles';
import infoServerReducer from '@digix/gov-ui/reducers/info-server';
import daoServerReducer from '@digix/gov-ui/reducers/dao-server';
import govUiReducer from '@digix/gov-ui/reducers/gov-ui';

import { Provider as GraphqlProvider } from '@digix/gov-ui/api/graphql';

import LandingPage from '@digix/gov-ui/pages';
import Proposals from '@digix/gov-ui/pages/proposals';
import CreateProposals from '@digix/gov-ui/pages/proposals/create';
import EditProposal from '@digix/gov-ui/pages/proposals/edit';
import TransactionHistory from '@digix/gov-ui/pages/user/history';
import Profile from '@digix/gov-ui/pages/user/profile';
import Help from '@digix/gov-ui/pages/help';
import Wallet from '@digix/gov-ui/pages/user/wallet';
import KycOfficerDashboard from '@digix/gov-ui/pages/kyc/officer';

import lightTheme from '@digix/gov-ui/theme/light';

import withHeaderAndPanel from '@digix/gov-ui/hocs/withHeaderAndPanel';

registerReducers({
  infoServer: { src: infoServerReducer },
  daoServer: { src: daoServerReducer },
  govUI: { src: govUiReducer },
});

// eslint-disable-next-line
const AuthenticatedRoute = ({ component: Component, isAuthenticated, ...rest }) => (
  <Route
    {...rest}
    render={props => (isAuthenticated ? <Component {...props} /> : <Redirect to="/" />)}
  />
);
export class Governance extends React.Component {
  render() {
    const { isAuthenticated } = this.props;
    return (
      <GraphqlProvider>
        <HashRouter>
          <ThemeProvider theme={lightTheme}>
            <Switch>
              <AuthenticatedRoute
                path="/proposals/create"
                component={withHeaderAndPanel(CreateProposals)}
                isAuthenticated={isAuthenticated}
              />
              <AuthenticatedRoute
                path="/proposals/edit"
                component={withHeaderAndPanel(EditProposal)}
                isAuthenticated={isAuthenticated}
              />
              <AuthenticatedRoute
                path="/proposals"
                component={withHeaderAndPanel(Proposals)}
                isAuthenticated={isAuthenticated}
              />
              <AuthenticatedRoute
                path="/wallet"
                component={withHeaderAndPanel(Wallet)}
                isAuthenticated={isAuthenticated}
              />

              <Route path="/kyc/admin" component={withHeaderAndPanel(KycOfficerDashboard)} />
              <Route path="/history" component={withHeaderAndPanel(TransactionHistory)} />
              <Route path="/profile" component={withHeaderAndPanel(Profile)} />
              <Route path="/help" component={withHeaderAndPanel(Help)} />
              <Route path="/" component={withHeaderAndPanel(LandingPage)} />
            </Switch>
          </ThemeProvider>
        </HashRouter>
      </GraphqlProvider>
    );
  }
}

Governance.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
};

export default withRouter(
  connect(
    ({ govUI: { isAuthenticated } }) => ({
      isAuthenticated,
    }),
    {}
  )(Governance)
);

// export default Governance;
