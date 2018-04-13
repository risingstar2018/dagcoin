import React, {Component} from 'react';

import {
    StyleSheet, View, Text, Platform
} from 'react-native';
import BasePageLayout from "../../../general/basePageLayout";
import {container, text} from "../../../styles/main";

class BackupSeed extends Component {
    constructor() {
        super();

        this.renderText = this.renderText.bind(this);
    }

    renderText() {
        let textInfo = '';

        if (Platform.OS !== 'web') {
            textInfo = 'To protect your funds, please use multisig wallets with redundancy, ' +
                'e.g. 1-of-2 wallet with one key on this device and another key on your laptop computer. ' +
                'Just the wallet seed is not enough.';
        } else {
            const appDataDir = 'C://test/stub';
            textInfo = `To restore your wallets, you will need a full backup of Dagcoin data at ${appDataDir}. ` +
                'Better yet, use multisig wallets with redundancy, ' +
                'e.g. 1-of-2 wallet with one key on this device and another key on your smartphone. ' +
                'Just the wallet seed is not enough.';
        }

        return (<Text style={text.textGray}>
            {textInfo}
        </Text>);
    }

    render() {
        return (
            <BasePageLayout style={container.p30}>
                {this.renderText()}
            </BasePageLayout>
        );
    }
}

const styles = StyleSheet.create({
});

export default BackupSeed;
