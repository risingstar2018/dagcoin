import React, {Component} from 'react';

import {
    StyleSheet, View, Text
} from 'react-native';
import DagForm, {validators} from "../../dagForm";
import DagPassword from "../../dagPassword";
import DagButton from "../../dagButton";

import { container, font, text } from "../../../styles/main";
import DagModal from "../dagModal";

class DagSetPasswordModal extends Component {
    constructor() {
        super();

        this.state = {
            tempPassword: '',
            password: ''
        }
    }

    onPasswordChange(value) {
        this.setState({
            tempPassword: value
        });
    };

    onCancelClick() {
        this.props.onCancel();
    }

    onSetPasswordClick() {
        if (!this.state.password) {
            this.setState({
                password: this.state.tempPassword,
                tempPassword: ''
            });

            return;
        }

        this.props.onSetPassword(this.state.password);
    }

    getValidators() {
        if (!this.state.password) {
            return [
                validators.required(),
                (value) => { return { isValid: value && value.length >= 8, error: 'Password must be at least 8 characters long' } },
                (value) => { return { isValid: value && value.search(/[a-z]/i) >= 0, error: 'Password must contain at least one letter' } },
                (value) => { return { isValid: value && value.search(/[0-9]/) >= 0, error: 'Password must contain at least one digit' } },
                (value) => { return { isValid: value && value.search(/[!@#$%^&*]/) >= 0, error: 'Password must contain at least one special character' } },
            ];
        } else {
            return [
                (value) => { return { isValid: value === this.state.password } }
            ];
        }
    }

    getHeaderText() {
        if (!this.state.password) {
            return 'Set up a password';
        } else {
            return 'Repeat password';
        }
    }

    render() {
        return (
            <DagModal onClose={this.onCancelClick.bind(this)}
                      style={container.p20}>
                <View style={styles.container}>
                    <Text style={StyleSheet.flatten([styles.header, text.textCenter, font.weight700, container.m20b])}>{this.getHeaderText().toUpperCase()}</Text>

                    <DagForm>
                        <DagPassword validators={this.getValidators()}
                                     errorStyle={StyleSheet.flatten([container.p10t, text.textCenter])}
                                     style={container.m15b}
                                     value={this.state.tempPassword}
                                     placeholder={'Your password'}
                                     onValueChange={this.onPasswordChange.bind(this)}/>

                        <View style={styles.buttonsContainer}>
                            <DagButton style={StyleSheet.flatten([styles.button, styles.cancelButton, container.m15r])}
                                       textStyle={styles.cancelButtonText}
                                       buttonText={'CANCEL'}
                                       onClick={this.onCancelClick.bind(this)} />
                            <DagButton style={StyleSheet.flatten([styles.button, container.m15l])}
                                       buttonText={'SET'}
                                       type={'submit'}
                                       onClick={this.onSetPasswordClick.bind(this)} />
                        </View>
                    </DagForm>

                    <Text style={StyleSheet.flatten([text.textRed, text.textCenter, font.size12, container.m20t])}>
                        Your wallet key will be encrypted. Password cannot be recovered. Be sure to write it down
                    </Text>
                </View>
            </DagModal>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    header: {
        color: 'rgb(52, 73, 94)'
    },
    buttonsContainer: {
        flex: 1,
        flexDirection: 'row'
    },
    button: {
        borderRadius: 100,
        padding: 15,
        shadowOpacity: 0,
        flex: 1
    },
    cancelButton: {
        borderColor: 'rgb(165, 178, 191)',
        borderWidth: 1,
        borderStyle: 'solid',
        backgroundColor: '#fff'
    },
    cancelButtonText: {
        color: 'rgb(165, 178, 191)'
    }
});

export default DagSetPasswordModal;


