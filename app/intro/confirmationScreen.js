import React, {Component} from 'react';

import {
    StyleSheet, View, CheckBox, Text, Dimensions
} from 'react-native';

import { container, text, font } from "../styles/main";

import MainPageLayout from "../general/mainPageLayout";
import DagButton from "../controls/dagButton";

const screenWidth = Dimensions.get('window').width;

class ConfirmationScreen extends Component {
    constructor() {
        super();

        this.state = {
            activeSlide: 0
        }
    }

    render() {
        return (
            <MainPageLayout>
                <View>
                    <Text style={StyleSheet.flatten([font.size24, text.textCenter])}>Almost done!</Text>
                    <Text style={StyleSheet.flatten([text.textCenter, container.m10t])}>As a security precaution we would like to go over some major points</Text>
                </View>
                <View style={StyleSheet.flatten([styles.checkboxContainer, container.m40t])}>
                    <View style={styles.checkBox}>
                        <CheckBox style={container.m10t} value={this.state.checked} />
                        <Text style={StyleSheet.flatten([container.m15b, container.m15l])}>I understand that my funds are held securely on this device, not by a company.</Text>
                    </View>
                    <View style={styles.checkBox}>
                        <CheckBox style={container.m10t} value={this.state.checked}/>
                        <Text style={StyleSheet.flatten([container.m15b, container.m15l])}>I understand that if this app is moved to another device or deleted, my dagcoin can only be recovered with the backup phrase.</Text>
                    </View>
                </View>
                <View style={StyleSheet.flatten([styles.termsContainer])}>
                    <View style={StyleSheet.flatten([styles.checkboxContainer, container.m40t])}>
                        <View style={styles.checkBox}>
                            <CheckBox style={container.m10t} value={this.state.checked} />
                            <Text style={StyleSheet.flatten([container.m15b, container.m15l])}>I have read, understood and agree to terms of use.</Text>
                        </View>
                    </View>
                    <View>
                        <DagButton buttonText={"CONFIRM & FINISH"}></DagButton>
                    </View>
                </View>
            </MainPageLayout>
        );
    }
}

const styles = StyleSheet.create({
    checkboxContainer: {
        flex: 1,
        flexDirection: 'column'
    },
    checkBox: {
        flex: 1,
        flexDirection: 'row'
    },
    termsContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        width: screenWidth,
        marginLeft: -40,
        paddingLeft: 40,
        paddingRight: 40,
        paddingBottom: 20,
        backgroundColor: '#e4e4e4',
        borderTop: 1,
        borderTopStyle: 'solid',
        borderTopColor: '#ddd'
    }
});

export default ConfirmationScreen;
