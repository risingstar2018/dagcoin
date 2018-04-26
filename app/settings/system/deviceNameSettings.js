import React, {Component} from 'react';

import {
    StyleSheet, Text, View
} from 'react-native';

import {container, text, font} from "../../styles/main";
import SettingsPageLayout from "../settingsPageLayout";
import DagButton from "../../controls/dagButton";
import DagTextInput  from "../../controls/dagTextInput";
import {validators} from "../../controls/dagForm";
import DagForm from "../../controls/dagForm";

class DeviceNameSettings extends Component {
    constructor() {
        super();

        this.state = {
            deviceName: 'Stub Device Name'
        };
    }

    onSaveClick() {
        console.log(this.state.deviceName);
    }

    onDeviceNameChange(text) {
        this.setState({
            deviceName: text
        });
    }

    render() {
        return (
            <SettingsPageLayout canBack={true} title={'Device Name'.toUpperCase()}>
                <View style={styles.container}>
                    <View style={StyleSheet.flatten([styles.controlsContainer, container.p40t, container.p40l, container.p40r, container.m20b])}>
                        <Text style={StyleSheet.flatten([text.textGray, font.weight700, font.size11])}></Text>

                        <DagForm>
                            <DagTextInput label={'Device name'} validators={[validators.required()]} style={StyleSheet.flatten([container.m20b])}
                                          onValueChange={this.onDeviceNameChange.bind(this)}
                                          value={this.state.deviceName}/>
                            <DagButton text={"SAVE"} type={'submit'} onClick={this.onSaveClick.bind(this)} />
                        </DagForm>
                    </View>

                    <Text style={StyleSheet.flatten([text.textGray, font.weight700, font.size11])}>Device name is visible to other devices you communicate with.</Text>
                </View>
            </SettingsPageLayout>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center'
    },
    controlsContainer: {
        alignSelf: 'stretch'
    }
});

export default DeviceNameSettings;
