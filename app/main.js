import React, { Component } from 'react';
import { Provider } from 'react-redux';

import configureStore from './store/configureStore';
import Navigator from "./navigator/navigator";
import RootHandler from "./handlers/rootHandler";

const store = configureStore();

class Main extends Component {
    constructor() {
        super();

        RootHandler.register();
    }

    getInitialScreen() {
        return 'Intro';
    }

    render() {
        return (
            <Provider store={store}>
                <Navigator initial={this.getInitialScreen()} />
            </Provider>
        );
    }
}

export default Main;
