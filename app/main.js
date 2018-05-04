import React, { Component } from 'react';
import { Provider } from 'react-redux';

import configureStore from './store/configureStore';
import Navigator from "./navigator/navigator";

const store = configureStore();

class Main extends Component {
    render() {
        return (
            <Provider store={store}>
                <Navigator initial='Intro'/>
            </Provider>
        );
    }
}

export default Main;
