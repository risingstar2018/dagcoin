import React, {Component} from 'react';

import {
    StyleSheet
} from 'react-native';

import {container} from "../styles/main";
import DagListView from "../controls/dagListView/dagListView";
import SettingsPageLayout from "./settingsPageLayout";

class AboutDeviceSettings extends Component {
    constructor() {
        super();
    }

    render() {
        const options = [
            {
                title: 'Device address',
                description: '0O766XKUNAK2U24ISKJKSTQ3YIU5QW44L (stub)'
            }
        ];

        return (
            <SettingsPageLayout canBack={true} title={'About Device'.toUpperCase()}>
                <DagListView style={container.m10b} options={options}/>
            </SettingsPageLayout>
        );
    }
}

const styles = StyleSheet.create({

});

export default AboutDeviceSettings;
