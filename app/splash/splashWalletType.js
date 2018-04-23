import React, {Component} from 'react';

import {
    StyleSheet, View, Text
} from 'react-native';

import DagButton from '../controls/dagButton';
import DagRadioGroup from '../controls/dagRadioGroup';
import { container, text, font } from "../styles/main";
import MainPageLayout from "../general/mainPageLayout";

class SplashWalletType extends Component {
    constructor(){
        super();

        this.state = {
            selectedType: 'light'
        };
    }

    onSetWalletTypeClick() {
        console.log(this.state.selectedType);
    }

    onWalletTypeChange(value) {
        this.setState({
            selectedType: value
        });
    }

    render() {
        const options = [
            {
                label: 'DOWNLOAD THE ENTIRE DAGCOIN DATABASE',
                value: 'full',
                text: 'The wallet will contain the most current ' +
                'state of the entire Dagcoin database. This option is better ' +
                'for privacy but will take several gigabytes of storage and the initial sync will take several days. ' +
                'CPU load will be high during sync.'
            },
            {
                label: 'KEEP ONLY DATA RELEVANT TO YOU',
                value: 'light',
                text: 'The wallet will contain minimum information relevant to you. The wallet vendor will be able to know ' +
                'some of your balances and will be able to see which transactions are yours, but you can start using the ' +
                'wallet immediately and the wallet is fully functional.'
            }
        ];

        return (
            <MainPageLayout>
                <View style={StyleSheet.flatten([styles.container])}>
                    <Text style={StyleSheet.flatten([text.textBrand, font.weight700, font.size14, container.m20b])}>{"Please choose the type of this wallet".toUpperCase()}</Text>

                    <DagRadioGroup options={options}
                                   onSelect={this.onWalletTypeChange.bind(this)}
                                   selectedOption={this.state.selectedType}></DagRadioGroup>

                    <DagButton buttonText={"CONTINUE"} onClick={this.onSetWalletTypeClick.bind(this)}></DagButton>
                </View>
            </MainPageLayout>
        );
    }
}

const styles = StyleSheet.create({
    container: {
    }
});

export default SplashWalletType;