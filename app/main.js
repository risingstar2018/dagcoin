import React, { Component } from 'react';
import { Provider } from 'react-redux';

import configureStore from './store/configureStore';
import Navigator from "./navigator/navigator";
import RootHandler from "./handlers/rootHandler";
import {StyleSheet, View} from "react-native";
import DagSideMenu from './sideMenu/dagSideMenu';
import routes from "./navigator/routes";
import {container} from "./styles/main";

import DagModalContainer from "./controls/dagModal/dagModalContainer";
import DagToast from "./controls/dagToast/dagToast";

const store = configureStore();

class Main extends Component {
    constructor() {
        super();

        this.state = {
            initial : {
                component: routes.Intro,
                navParams: {
                    sideMenu: false
                }
            }
        };

        RootHandler.register();
    }

    render() {
        return (
            <Provider store={store}>
                <DagSideMenu>
                    <View style={[container.backgroundDefaultApp, container.flex]}>
                        <DagToast />
                        <DagModalContainer />
                        <Navigator initial={this.state.initial} />
                    </View>
                </DagSideMenu>
            </Provider>
        );
    }
}

export default Main;
