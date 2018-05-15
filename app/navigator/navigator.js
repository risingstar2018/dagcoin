import React from 'react'
import {Animated, View, Platform} from 'react-native'
import {getView} from './routes';
import NavigationManager from './navigationManager';
import DagSideMenuManager from "../sideMenu/dagSideMenuManager";

DEFAULT_FX = {prop: 'opacity', fromValue: 1, toValue: 1};

const defaultNavParams = {
    permanent: false,
    sideMenu: true
};

const ACTIONS = {
    INIT: "INIT",
    BACK: "BACK",
    LINK_TO: "LINK_TO"
};

export default class Navigator extends React.Component {
    constructor(props) {
        super(props);

        NavigationManager.registerNavigator(this);

        this.state = {
            currentView: null,
            view: null,
            fxValue: new Animated.Value(0)
        };

        this.init();
    }

    currentComp = null;
    history = [];        // array of View IDs
    navParamsHistory = [];  // array of View navParams (to keep view navParams before transitioning for going back)
    navParams = null;
    stateHistory = [];       // array of Previous View States (to keep view state before transitioning for going back)

    init() {
        const initial = this.props.initial;
        const view = initial.component;
        this.navParams = Object.assign({}, defaultNavParams, initial.navParams);
        this.processNavParams(this.navParams, ACTIONS.INIT);

        this.history = [view];
        this.lastState = null;
        this.stateHistory = [this.lastState];
        this.navParamsHistory = [this.navParams];
        const {component} = this.getViewObject(view);
        this.currentComp = component;
    }

    startViewAnimation(fx) {
        Animated.timing(this.state.fxValue, fx).start();
    }

    componentDidMount() {
        this.startViewAnimation(DEFAULT_FX);
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

        this.setState({currentView: lastViewId});
    };

    processNavParams(navParams, action) {
        if (!navParams.sideMenu) {
            DagSideMenuManager.disable();
        } else {
            DagSideMenuManager.enable();
        }
    }

    linkTo(context, viewId, navParams) {
        this.navParams = Object.assign({}, defaultNavParams, navParams);
        this.processNavParams(this.navParams, ACTIONS.LINK_TO);

        this.history.push(viewId);
        this.stateHistory.push(context.state);
        this.navParamsHistory.push(this.navParams);
        const {fx} = this.getViewObject(viewId);

        this.setState({currentView: viewId, fxValue: new Animated.Value(fx.fromValue)});
    };

    getViewObject(viewId) {
        const obj = getView(viewId);
        if (typeof obj === 'object') {
            // example: views={{ personDetails: { component: PersonDetails, fx: fxObject } }}
            return {component: obj.component, fx: obj.fx}
        } else {
            // example: views={{ contactUs: ContactUs }}
            return {component: obj, fx: DEFAULT_FX}
        }
    };

    render() {
        let currentFx = DEFAULT_FX;
        if (this.state.currentView) {
            const {component, fx} = this.getViewObject(this.state.currentView);
            this.currentComp = component;
            currentFx = fx;
            this.startViewAnimation(fx);
        }

        return (
            <Animated.View style={{flex: 1, [currentFx.prop]: this.state.fxValue}}>
                <this.currentComp navParams={this.navParams}/>
            </Animated.View>
        )
    }
}
