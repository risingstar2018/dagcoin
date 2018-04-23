import React, {Component} from 'react';

import {
    StyleSheet, View, Text
} from 'react-native';
import {container, font, text} from "../../../styles/main";
import BasePageLayout from "../../../general/basePageLayout";
import { validators } from "../../../controls/dagForm";
import DagPassword from "../../../controls/dagPassword";
import DagButton from "../../../controls/dagButton";
import DagSwitch from "../../../controls/dagSwitch";
import DagForm from "../../../controls/dagForm";

class FullBackup extends Component {
    constructor() {
        super();

        this.state = {
            password: '',
            confirmPassword: '',
            compress: false
        }
    }

    onPasswordChange(value) {
        this.setState({
            password: value
        });
    }

    onConfirmPasswordChange(value) {
        this.setState({
            confirmPassword: value
        });
    }

    onCompressChange(value) {
        this.setState({
            compress: value
        });
    }

    onExportClick() {
        console.log('export');
        console.log(this.state);
    }

    render() {
        return (
            <BasePageLayout style={StyleSheet.flatten([container.p40, container.m40t])}>
                <DagForm>
                    <DagPassword style={container.m20b}
                                 label={'Set up a Password'}
                                 validators={[
                                     validators.required()
                                 ]}
                                 value={this.state.password}
                                 placeholder={'Your export password'}
                                 onValueChange={this.onPasswordChange.bind(this)}/>

                    <DagPassword label={'Repeat the password'}
                                 style={container.m20b}
                                 validators={[(value) => { return { isValid: value === this.state.password }; }]}
                                 value={this.state.confirmPassword}
                                 placeholder={'Repeat password'}
                                 onValueChange={this.onConfirmPasswordChange.bind(this)}/>

                    <View style={StyleSheet.flatten([styles.compressContainer, container.m20b])}>
                        <Text style={StyleSheet.flatten([text.textGray, font.size14])}>Compress the file? (Slower)</Text>
                        <DagSwitch style={styles.compressControl} value={this.state.compress} onValueChange={this.onCompressChange.bind(this)} />
                    </View>

                    <DagButton onClick={this.onExportClick.bind(this)}
                               type={'submit'}
                               buttonText={'Export'} />
                </DagForm>
            </BasePageLayout>
        );
    }
}

const styles = StyleSheet.create({
    compressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    compressControl: {
        position: 'absolute',
        right: 0
    }
});

export default FullBackup;
