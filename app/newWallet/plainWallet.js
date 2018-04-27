import React, {Component} from 'react';

import {
    StyleSheet, View, Text
} from 'react-native';
import {container, font} from "../styles/main";
import DagForm, {validators} from "../controls/dagForm";
import DagTextInput from "../controls/dagTextInput";
import DagSwitch from "../controls/dagSwitch";
import DagButton from "../controls/dagButton";
import BasePageLayout from "../general/basePageLayout";

class PlainWallet extends Component {
    constructor() {
        super();

        this.state = {
            walletName: '',
            isSingleAddress: false
        };
    }

    onCreateNewWalletClick() {
        console.log('create new wallet');
    }

    onWalletNameChange(value) {
        this.setState({
            walletName: value
        });
    }

    onSingleAddressChange(value) {
        this.setState({
            isSingleAddress: value
        });
    }

    render() {
        return (
            <BasePageLayout style={container.p30}>
                <DagForm>
                    <DagTextInput value={this.state.walletName}
                                  label={'Wallet name'.toUpperCase()}
                                  placeholder={'New wallet'}
                                  validators={[validators.required()]}
                                  style={StyleSheet.flatten([container.m20b])}
                                  onValueChange={this.onWalletNameChange.bind(this)}/>

                    <Text style={StyleSheet.flatten([container.m20b])}>
                        Single address wallets will not spawn new addresses for every transaction, change will always go to the one and only address the wallet contains.
                    </Text>

                    <View style={StyleSheet.flatten([styles.singleAddressContainer, container.m20b])}>
                        <Text style={StyleSheet.flatten([styles.singleAddressText, font.weight700, font.size10])}>{'Single address wallet'.toUpperCase()}</Text>
                        <DagSwitch style={styles.singleAddressControl} value={this.state.isSingleAddress} onValueChange={this.onSingleAddressChange.bind(this)} />
                    </View>

                    <DagButton type={'submit'}
                               text={'create new wallet'.toUpperCase()}
                               onClick={this.onCreateNewWalletClick.bind(this)}/>
                </DagForm>
            </BasePageLayout>
        );
    }
}

const styles = StyleSheet.create({
    singleAddressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    singleAddressControl: {
        position: 'absolute',
        right: 0
    },
    singleAddressText: {
        color: '#aaaaaa'
    }
});

export default PlainWallet;
