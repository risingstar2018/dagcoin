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

class RecoverBackup extends Component {
    constructor() {
        super();

        this.state = {
            password: ''
        }
    }

    onPasswordChange(value) {
        this.setState({
            password: value
        })
    }

    onImportClick() {
        console.log('Import');
        console.log(this.state);
    }

    render() {
        return (
            <BasePageLayout style={StyleSheet.flatten([container.p40, container.m40t])}>
                <DagForm style={container.m5b}>
                    <DagPassword style={container.m20b}
                                 label={'Password'}
                                 validators={[
                                     validators.required()
                                 ]}
                                 value={this.state.password}
                                 placeholder={'Password'}
                                 onValueChange={this.onPasswordChange.bind(this)}/>

                    <DagButton onClick={this.onImportClick.bind(this)}
                               type={'submit'}
                               buttonText={'Import'.toUpperCase()} />
                </DagForm>
                <Text style={StyleSheet.flatten([font.size12, text.textRed, text.textCenter])}>WARNING: This will permanently delete all your existing wallets!</Text>
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

export default RecoverBackup;
