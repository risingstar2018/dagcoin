import React, {Component} from 'react';

import {
    StyleSheet, View, Text
} from 'react-native';

import DagButton from '../controls/dagButton';
import DagRadioGroup from '../controls/dagRadioGroup';
import { container, text, font } from "../styles/main";
import MainPageLayout from "../general/mainPageLayout";

class SplashRegistration extends Component {
    constructor(){
        super();

        this.state = {
            selectedType: 'default'
        };
    }

    onSetRegistrationTypeClick() {
        console.log(this.state.selectedType);
    }

    onRegistrationTypeChange(value) {
        this.setState({
            selectedType: value
        });
    }

    render() {
        const options = [
            {label: 'Default settings (recommended)'.toUpperCase(), value: 'default', text: 'Creates light wallet which will contain minimum information relevant to you. ' +
                'The wallet vendor will be able to know some of your balances and will be able to see which transactions are yours, but ' +
                'you can start using the wallet immediately.'
            },
            {label: 'Restore from backup'.toUpperCase(), value: 'backup', text: `Allows to restore existing wallet from a backup.`},
            {label: 'Custom settings'.toUpperCase(), value: 'custom', text: `Allows to choose wallet type.`}
        ];

        return (
            <MainPageLayout>
                <View style={StyleSheet.flatten([styles.container])}>
                    <Text style={StyleSheet.flatten([text.textBrand, font.weight700, font.size14, container.m20b])}>{"Please choose registration type".toUpperCase()}</Text>

                    <DagRadioGroup options={options}
                                   onSelect={this.onRegistrationTypeChange.bind(this)}
                                   selectedOption={this.state.selectedType}></DagRadioGroup>

                    <DagButton text={"CONTINUE"} onClick={this.onSetRegistrationTypeClick.bind(this)}></DagButton>
                </View>
            </MainPageLayout>
        );
    }
}

const styles = StyleSheet.create({
    container: {
    }
});

export default SplashRegistration;
