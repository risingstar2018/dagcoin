import React, {Component} from 'react';

import {
    Platform, StyleSheet, Text
} from 'react-native';

import {container, text} from "../../styles/main";
import DagListView from "../../controls/dagListView/dagListView";
import SettingsPageLayout from "../settingsPageLayout";
import DagSwitch from "../../controls/dagSwitch";
import DagModalManager from "../../controls/dagModal/dagModalManager";
import Navigator from 'Navigator';
import DagSetPasswordModal from "../../controls/dagModal/modals/dagSetPasswordModal";

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

    onPasswordCancel() {
        DagModalManager.hide();

        this.setState({
            setPassword: false
        });
    }

    onPasswordSet(value) {
        console.log(value);

        DagModalManager.hide();

        this.setState({
            setPassword: true
        });
    }

    onSetPasswordChanged() {
        this.setState({
            setPassword: !this.state.setPassword
        });

        if (this.state.setPassword) {
            DagModalManager.hide();
        }
        else {
            DagModalManager.show(<DagSetPasswordModal onCancel={this.onPasswordCancel.bind(this)} onSetPassword={this.onPasswordSet.bind(this)}/>);
        }
    }

    onSetFingerprintChanged() {
        this.setState({
            setFingerprint: !this.state.setFingerprint
        });
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
                    Navigator.to('/settings/security/backup');
                }
            },
            {
                title: 'Recover wallet',
                description: '',
                onClick: () => {
                    Navigator.to('/settings/security/recovery');
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
            <SettingsPageLayout canBack={true} title={'Security'.toUpperCase()}>
                <DagListView style={container.m10b} options={options}/>
                <DagListView title={'Authorization type'} style={container.m10b} options={authOptions}/>
            </SettingsPageLayout>
        );
    }
}

const styles = StyleSheet.create({

});

export default SecuritySettings;
