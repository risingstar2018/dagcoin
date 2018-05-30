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
import BasePageLayout from "../general/basePageLayout";
import {changeWalletType, changeDeviceName} from "../actions/generalActions";
import {connect} from "react-redux";
import profileService from '../services/wallet/profile.service';

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
        this.setState({
            deviceNameSet: true
        });
    }

    onGetStartedClick() {
        this.props.changeWalletType(this.props.navParams.walletType);
        this.props.changeDeviceName(this.state.deviceName);
        Navigator.to(this, routes.Wallet, { permanent: true });
        profileService.createNewProfile({})
            .then((data) => console.log('resolved ' + data))
            .catch((data) => console.log('catch ' + data));
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
            return (
                <DagForm style={StyleSheet.flatten([styles.deviceNameContainer])}>
                    <DagTextInput
                        label={"Please name this device".toUpperCase()}
                        labelStyle={[text.textCenter, text.textGray, font.size11, container.m20b]}
                        validators={[validators.required()]}
                        containerStyle={StyleSheet.flatten([container.m40b])}
                        onValueChange={this.onDeviceNameChange.bind(this)}
                        value={this.state.deviceName}
                    />

                    <DagButton
                        type={'submit'}
                        text={"CONTINUE"}
                        onClick={this.onSetDeviceNameClick.bind(this)}
                    />
                </DagForm>
            );
        }
    }

    render() {
        return (
            <BackgroundLayout style={container.p0}>
                <BasePageLayout>
                    <View style={StyleSheet.flatten([styles.container])}>
                        <Text style={StyleSheet.flatten([text.textBrand, font.weight700, font.size16])}>{"WELCOME TO DAGCOIN"}</Text>
                        <Text style={StyleSheet.flatten([text.textGray, font.weight200, font.size14])}>{"A wallet for decentralized value"}</Text>

                        <Image style={StyleSheet.flatten([styles.brand, container.m40b, container.m40t])}
                               source={require('../../img/icon-splash-brand.png')} />

                        {this.renderSubView()}
                    </View>
                </BasePageLayout>
            </BackgroundLayout>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center'
    },
    deviceNameContainer: {
        width: 250
    },
    brand: {
        width: 101,
        height: 195
    }
});

function mapStateToProps(state) {
    return {
        deviceName: state.general.deviceName,
        walletType: state.general.walletType
    };
}

const mapDispatchToProps = {
    changeWalletType,
    changeDeviceName
};

export default connect(mapStateToProps, mapDispatchToProps)(SplashDeviceName);
