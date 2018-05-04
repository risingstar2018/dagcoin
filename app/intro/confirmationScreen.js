import React, {Component} from 'react';

import {
    StyleSheet, View, CheckBox, Text, Dimensions
} from 'react-native';

import { container, text, font } from "../styles/main";

import DagButton from "../controls/dagButton";
import BackgroundLayout from "../general/backgroundLayout";
import Navigator from '../navigator/navigationManager';
import { routes } from '../navigator/routes';

const screenWidth = Dimensions.get('window').width;

class ConfirmationScreen extends Component {
    constructor() {
        super();

        this.state = {
            activeSlide: 0,
            checkbox1: false,
            checkbox2: false,
            checkbox3: false
        }
    }

    renderTermsContainer() {
        if (!this.state.checkbox1 || !this.state.checkbox2) {
            return null;
        }

        return (<View style={StyleSheet.flatten([styles.termsContainer])}>
            <View style={StyleSheet.flatten([styles.checkboxContainer, container.m40t])}>
                <View style={styles.checkBox}>
                    <CheckBox style={container.m10t} value={this.state.checkbox3} onValueChange={(value) => this.setState({checkbox3: value})}  />
                    <Text style={StyleSheet.flatten([container.m15b, container.m15l])}>I have read, understood and agree to terms of use.</Text>
                </View>
            </View>
            <View>
                <DagButton onClick={() => Navigator.to(this, routes.SplashRegistration)} disabled={!this.state.checkbox1 || !this.state.checkbox2 || !this.state.checkbox3} text={"CONFIRM & FINISH"} />
            </View>
        </View>);
    }

    render() {
        return (
            <BackgroundLayout>
                <View>
                    <Text style={StyleSheet.flatten([font.size24, text.textCenter])}>Almost done!</Text>
                    <Text style={StyleSheet.flatten([text.textCenter, container.m10t])}>As a security precaution we would like to go over some major points</Text>
                </View>
                <View style={StyleSheet.flatten([styles.checkboxContainer, container.m40t])}>
                    <View style={styles.checkBox}>
                        <CheckBox style={container.m10t} value={this.state.checkbox1} onValueChange={(value) => this.setState({checkbox1: value})} />
                        <Text style={StyleSheet.flatten([container.m15b, container.m15l])}>I understand that my funds are held securely on this device, not by a company.</Text>
                    </View>
                    <View style={styles.checkBox}>
                        <CheckBox style={container.m10t} value={this.state.checkbox2} onValueChange={(value) => this.setState({checkbox2: value})} />
                        <Text style={StyleSheet.flatten([container.m15b, container.m15l])}>I understand that if this app is moved to another device or deleted, my dagcoin can only be recovered with the backup phrase.</Text>
                    </View>
                </View>
                {this.renderTermsContainer()}
            </BackgroundLayout>
        );
    }
}

const styles = StyleSheet.create({
    checkboxContainer: {
        flexDirection: 'column'
    },
    checkBox: {
        flexDirection: 'row'
    },
    termsContainer: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        width: screenWidth,
        marginLeft: -40,
        paddingLeft: 40,
        paddingRight: 40,
        paddingBottom: 20,
        backgroundColor: '#e4e4e4',
        borderStyle: 'solid',
        borderTopColor: '#ddd'
    }
});

export default ConfirmationScreen;
