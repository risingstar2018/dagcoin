import React, {Component} from 'react';

import {
    StyleSheet, View, Text, Image
} from 'react-native';

import Navigator from '../navigator/navigationManager';
import { routes } from '../navigator/routes';
import DagButton from '../controls/dagButton';
import {container, text, font} from "../styles/main";
import DagTextInput from "../controls/dagTextInput";
import {validators} from "../controls/dagForm";
import DagForm from "../controls/dagForm";
import BackgroundLayout from "../general/backgroundLayout";

class SplashDeviceName extends Component {
    constructor() {
        super();

        this.state = {
            deviceName: '',
            deviceNameSet: false
        };

        this.renderSubView = this.renderSubView.bind(this);
    }

    onSetDeviceNameClick() {
        console.log(this.state.deviceName);
        this.setState({
            deviceNameSet: true
        });
    }

    onGetStartedClick() {
        console.log(this.state.deviceName);
        Navigator.to(this, routes.Wallet);
    }

    onDeviceNameChange(text) {
        this.setState({
            deviceName: text
        });
    }

    renderSubView() {
        if (this.state.deviceNameSet) {
            return (<View style={styles.deviceNameContainer}>
                <Text style={StyleSheet.flatten([text.textGray, text.textCenter, font.size14, container.m20b])}>
                    Your wallet will be created on this device, keep it safe. See your backup options in the Settings
                    menu.
                </Text>
                <Text style={StyleSheet.flatten([text.textGray, text.textCenter, font.size14, container.m20b])}>
                    Also in the Settings menu, you will find security options such as setting a password.
                </Text>
                <View style={StyleSheet.flatten([styles.controlsContainer])}>
                    <DagButton text={"GET STARTED"} onClick={this.onGetStartedClick.bind(this)} />
                </View>
            </View>);
        } else {
            return (<View style={styles.deviceNameContainer}>
                <Text
                    style={StyleSheet.flatten([text.textGray, font.weight700, font.size11])}>{"Please name this device".toUpperCase()}</Text>

                <View style={StyleSheet.flatten([styles.controlsContainer])}>
                    <DagForm>
                        <DagTextInput validators={[validators.required()]}
                                      style={StyleSheet.flatten([container.m40b, container.m20t])}
                                      onValueChange={this.onDeviceNameChange.bind(this)}
                                      value={this.state.deviceName}/>

                        <DagButton text={"CONTINUE"} disabled={!this.state.deviceName}
                                   onClick={this.onSetDeviceNameClick.bind(this)} />
                    </DagForm>
                </View>
            </View>);
        }
    }

    render() {
        return (
            <BackgroundLayout>
                <View style={StyleSheet.flatten([styles.container])}>
                    <Text
                        style={StyleSheet.flatten([text.textBrand, font.weight700, font.size16])}>{"WELCOME TO DAGCOIN"}</Text>
                    <Text
                        style={StyleSheet.flatten([text.textGray, font.weight200, font.size14])}>{"A wallet for decentralized value"}</Text>

                    <Image style={StyleSheet.flatten([styles.brand, container.m40b, container.m40t])}
                           source={require('../../img/icon-splash-brand.png')} />

                    {this.renderSubView()}
                </View>
            </BackgroundLayout>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center'
    },
    deviceNameContainer: {
        width: 250,
        flex: 1,
        alignItems: 'center'
    },
    controlsContainer: {
        width: 250
    },
    brand: {
        width: 101,
        height: 195
    }
});

export default SplashDeviceName;
