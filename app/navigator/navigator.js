import React from 'react'
import {Animated, View, Platform, BackHandler} from 'react-native'
import {getView} from './routes';
import NavigationManager from './navigationManager';
import DagModalContainer from "../controls/dagModal/dagModalContainer";

DEFAULT_FX = {prop: 'opacity', fromValue: 0, toValue: 1};

export default class Navigator extends React.Component {
    constructor() {
        super();

        NavigationManager.registerNavigator(this);

        this.state = {
            currentView: null,
            view: null,
            fxValue: new Animated.Value(0)
        };
    }

    currentComp = null;
    history = [];        // array of View IDs
    navParamsHistory = [];  // array of View navParams (to keep view navParams before transitioning for going back)
    navParams = null;
    stateHistory = [];       // array of Previous View States (to keep view state before transitioning for going back)

    startViewAnimation(fx) {
        Animated.timing(this.state.fxValue, fx).start()
    }

    componentDidMount() {
        this.startViewAnimation(DEFAULT_FX)
    }

    canBack() {
        return this.history.length > 1;
    }

    clearHistory() {
        this.history = [];
        this.stateHistory = [];
        this.navParamsHistory = [];
    }

    back = () => {
        this.lastState = this.stateHistory[this.stateHistory.length - 1];
        this.stateHistory.pop();
        this.history.pop();
        this.navParamsHistory.pop();
        this.navParams = this.navParamsHistory[this.navParamsHistory.length - 1];
        const lastViewId = this.history[this.history.length - 1];
        this.setState({currentView: lastViewId})
    };

    linkTo = (context, viewId, navParams) => {
        this.history.push(viewId);
        this.stateHistory.push(context.state);
        this.navParamsHistory.push(navParams);
        this.navParams = navParams;
        const {fx} = this.getViewObject(viewId);
        this.setState({currentView: viewId, fxValue: new Animated.Value(fx.fromValue)})
    };

    getViewObject = (viewId) => {
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
        } else {
            this.history = [this.props.initial];
            this.lastState = null;
            this.stateHistory = [this.lastState];
            this.navParamsHistory = [this.navParams];
            const {component} = this.getViewObject(this.props.initial);
            this.currentComp = component;
        }

        return (
            <Animated.View style={{flex: 1, [currentFx.prop]: this.state.fxValue}}>
                <this.currentComp navParams={this.navParams}/>
            </Animated.View>
        )
    }
}
