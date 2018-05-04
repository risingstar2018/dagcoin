import React, {Component} from 'react';

import {
    StyleSheet
} from 'react-native';

import {container} from "../../styles/main";
import DagListView from "../../controls/dagListView/dagListView";
import SettingsPageLayout from "../settingsPageLayout";
import Navigator from '../../navigator/navigationManager';
import { routes } from '../../navigator/routes';

class AboutDagcoinSettings extends Component {
    constructor() {
        super();
    }

    render() {
        const infoOptions = [
            {
                title: 'Version',
                description: 'v.1.4.5t (stub)'
            },
            {
                title: 'Commit hash',
                description: 'vcb9cd41 (stub)'
            }
        ];

        const actionsOptions = [
            {
                title: 'Term of Use',
                description: '',
                onClick: () => {
                    Navigator.to(this, routes.Terms);
                }
            },
            {
                title: 'Session log',
                description: '',
                onClick: () => { console.log('Session log'); }
            }
        ];

        return (
            <SettingsPageLayout canBack={true} title={'About Dagcoin'.toUpperCase()}>
                <DagListView title={'Release information'} style={container.m15b} options={infoOptions}/>
                <DagListView style={container.m10b} options={actionsOptions}/>
            </SettingsPageLayout>
        );
    }
}

const styles = StyleSheet.create({

});

export default AboutDagcoinSettings;
