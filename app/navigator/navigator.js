import React from 'react';
import { View, Platform } from 'react-native';
import { getView } from './routes';
import NavigationManager from './navigationManager';
import DagSideMenuManager from '../sideMenu/dagSideMenuManager';

const defaultNavParams = {
  permanent: false,
  sideMenu: true,
};

const ACTIONS = {
  INIT: 'INIT',
  BACK: 'BACK',
  LINK_TO: 'LINK_TO',
};

export default class Navigator extends React.Component {
  constructor(props) {
    super(props);

    NavigationManager.registerNavigator(this);

    this.state = {
      currentView: null,
      view: null,
    };

    this.init();
  }

    currentComp = null;
    history = []; // array of View IDs
    navParamsHistory = []; // array of View navParams (to keep view navParams before transitioning for going back)
    navParams = null;
    stateHistory = []; // array of Previous View States (to keep view state before transitioning for going back)

    init() {
      const initial = this.props.initial;
      const view = initial.component;
      this.navParams = Object.assign({}, defaultNavParams, initial.navParams);
      this.processNavParams(this.navParams, ACTIONS.INIT);

      this.history = [view];
      this.lastState = null;
      this.stateHistory = [this.lastState];
      this.navParamsHistory = [this.navParams];
      const component = getView(view);
      this.currentComp = component;
    }

    canBack() {
      return this.navParamsHistory.length
            && !this.navParamsHistory[this.navParamsHistory.length - 1].permanent;
    }

    back() {
      this.navParams = this.navParamsHistory[this.navParamsHistory.length - 1];
      this.processNavParams(this.navParams, ACTIONS.BACK);

      this.lastState = this.stateHistory[this.stateHistory.length - 1];
      this.stateHistory.pop();
      this.history.pop();
      this.navParamsHistory.pop();
      const lastViewId = this.history[this.history.length - 1];

      this.setState({ currentView: lastViewId });
    }

    processNavParams(navParams, action) {
      if (!navParams.sideMenu) {
        DagSideMenuManager.disable();
      } else {
        DagSideMenuManager.enable();
      }
    }

    linkTo(context, viewId, navParams) {
      if (this.state.currentView === viewId) {
        return;
      }

      this.navParams = Object.assign({}, defaultNavParams, navParams);
      this.processNavParams(this.navParams, ACTIONS.LINK_TO);

      this.history.push(viewId);
      this.stateHistory.push(context.state);
      this.navParamsHistory.push(this.navParams);

      this.setState({ currentView: viewId });
    }

    render() {
      if (this.state.currentView) {
        this.currentComp = getView(this.state.currentView);
      }

      return (
        <View style={{ flex: 1 }}>
          <this.currentComp navParams={this.navParams} />
        </View>
      );
    }
}
