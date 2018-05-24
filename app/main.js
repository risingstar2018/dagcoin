import React, { Component } from 'react';
import {Provider} from 'react-redux';

import configureStore from './store/configureStore';
import {StyleSheet, View} from "react-native";
import App from "./app";

const store = configureStore();

class Main extends Component {
    constructor() {
        super();
    }

    render() {
        return (
            <Provider store={store}>
                <App />
            </Provider>
        );
    }
}


export default Main;
