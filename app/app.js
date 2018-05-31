import React, { Component } from 'react';
import {connect} from 'react-redux';

import Navigator from "./navigator/navigator";
import RootHandler from "./handlers/rootHandler";
import {StyleSheet, View} from "react-native";
import DagSideMenu from './sideMenu/dagSideMenu';
import routes from "./navigator/routes";
import {container} from "./styles/main";

import DagModalContainer from "./controls/dagModal/dagModalContainer";
import DagToast from "./controls/dagToast/dagToast";
import {init} from "./actions/generalActions";
import {initContacts} from "./actions/contactsActions";

class App extends Component {
    constructor() {
        super();

        RootHandler.register();
    }

    componentWillMount() {
        this.props.init();
        this.props.initContacts();
    }

    getInitialScreen() {
        let initial = null;

        if (this.props.walletType) {
            initial = {
                component: routes.Wallet,
                navParams: {
                    sideMenu: true
                }
            }
        } else {
            initial = {
                component: routes.Intro,
                navParams: {
                    sideMenu: true
                }
            }
        }

        return initial;
    }

    render() {
        if (!this.props.inited) {
            return null;
        }

        return (
            <DagSideMenu>
                <View style={[container.backgroundDefaultApp, container.flex]}>
                    <DagToast />
                    <DagModalContainer />
                    <Navigator initial={this.getInitialScreen()} />
                </View>
            </DagSideMenu>
        );
    }
}

function mapStateToProps(state) {
    return {
        inited: state.general.inited,
        walletType: state.general.walletType
    }
}

const mapDispatchToProps = {
    init,
    initContacts
};

export default AppWrapper = connect(mapStateToProps, mapDispatchToProps)(App);
