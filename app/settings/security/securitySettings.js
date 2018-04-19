import React, {Component} from 'react';

import {
    Platform, StyleSheet, Text
} from 'react-native';

import {container, text} from "../../styles/main";
import DagListView from "../../controls/dagListView/dagListView";
import SettingsPageLayout from "../settingsPageLayout";
import DagSwitch from "../../controls/dagSwitch";

class SecuritySettings extends Component {
    constructor() {
        super();

        this.state = {
            needBackup: true,
            setPassword: false,
            setFingerprint: false
        };

        this.renderBackupWarning = this.renderBackupWarning.bind(this);
        this.onSetPasswordChanged = this.onSetPasswordChanged.bind(this);
        this.onSetFingerprintChanged = this.onSetFingerprintChanged.bind(this);
    }

    onSetPasswordChanged() {
        this.setState({
            setPassword: !this.state.setPassword
        })
    }

    onSetFingerprintChanged() {
        this.setState({
            setFingerprint: !this.state.setFingerprint
        })
    }

    renderBackupWarning() {
        if (this.state.needBackup) {
            return (<Text style={StyleSheet.flatten([text.textRed, container.p10r])}>
                Still not done
            </Text>);
        }

        return null;
    }

    renderPasswordSwitch() {
        return (<DagSwitch value={this.state.setPassword} onValueChange={this.onSetPasswordChanged} />);
    }

    renderFingerprintSwitch() {
        return (<DagSwitch value={this.state.setFingerprint} onValueChange={this.onSetFingerprintChanged} />);
    }

    render() {
        const options = [
            {
                title: 'Backup wallet',
                description: '',
                children: this.renderBackupWarning(),
                onClick: () => {
                    console.log('Backup wallet');
                }
            },
            {
                title: 'Recover wallet',
                description: '',
                onClick: () => {
                    console.log('Recover wallet');
                }
            }
        ];

        const authOptions = [
            {
                title: 'Set password',
                description: '',
                children: this.renderPasswordSwitch()
            }
        ];

        if (Platform.OS !== 'web') {
            authOptions.push({
                title: 'Scan fingerprint',
                description: '',
                children: this.renderFingerprintSwitch()
            });
        }

        return (
            <SettingsPageLayout canBack={true} title={'System'.toUpperCase()}>
                <DagListView style={container.m10b} options={options}/>
                <DagListView title={'Authorization type'} style={container.m10b} options={authOptions}/>
            </SettingsPageLayout>
        );
    }
}

const styles = StyleSheet.create({

});

export default SecuritySettings;
