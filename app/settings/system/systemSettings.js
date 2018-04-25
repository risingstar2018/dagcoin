import React, {Component} from 'react';

import {
    StyleSheet
} from 'react-native';

import {container} from "../../styles/main";
import DagListView from "../../controls/dagListView/dagListView";
import SettingsPageLayout from "../settingsPageLayout";
import Navigator from 'Navigator';

class SystemSettings extends Component {
    constructor() {
        super();
    }

    render() {
        const options = [
            {
                title: 'Device name',
                description: 'Stub Device Name',
                onClick: () => {
                    Navigator.to('/settings/system/device-name');
                }
            },
            {
                title: 'Change Wallet type',
                description: 'Stub Wallet type',
                onClick: () => {
                    console.log('Change Wallet Type');
                }
            }
        ];

        return (
            <SettingsPageLayout canBack={true} title={'System'.toUpperCase()}>
                <DagListView style={container.m10b} options={options}/>
            </SettingsPageLayout>
        );
    }
}

const styles = StyleSheet.create({

});

export default SystemSettings;
