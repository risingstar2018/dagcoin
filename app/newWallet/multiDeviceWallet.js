import React, {Component} from 'react';

import {
    StyleSheet, View, Text, ScrollView
} from 'react-native';
import BasePageLayout from "../general/basePageLayout";
import {container, font} from "../styles/main";
import DagButton from "../controls/dagButton";
import DagForm, {validators} from "../controls/dagForm";
import DagTextInput from "../controls/dagTextInput";
import DagSwitch from "../controls/dagSwitch";
import DagSelect from "../controls/dagSelect";

class MultiDeviceWallet extends Component {
    constructor() {
        super();

        this.state = {
            walletName: '',
            isSingleAddress: false,
            totalNumber: '3',
            requiredNumber: '2',
            cosigners: {}
        };

        this.renderCosigners = this.renderCosigners.bind(this);
        this.getRequiredCosigners = this.getRequiredCosigners.bind(this);
        this.onCosignerChange = this.onCosignerChange.bind(this);
    }

    onCreateNewWalletClick() {
        console.log('create new wallet');
        console.log(this.state);
    }

    onWalletNameChange(value) {
        this.setState({
            walletName: value
        });
    }

    onSingleAddressChange(value) {
        this.setState({
            isSingleAddress: value
        });
    }

    onTotalNumberChange(value) {
        this.setState({
            totalNumber: value
        });
    }

    onRequiredNumberChange(value) {
        this.setState({
            requiredNumber: value
        });
    }

    onCosignerChange(value, cosigner) {
        this.state.cosigners[cosigner] = value;

        this.setState({
            cosigners: this.state.cosigners
        });
    }

    getRequiredCosigners(){
        let requiredCosigners = [];

        for (let i = 1; i <= this.state.totalNumber; i++) {
            requiredCosigners.push({ label: i.toString(), value: i.toString() });
        }

        return requiredCosigners;
    }

    renderCosigners() {
        let cosignerControls = [];

        for (let i = 1; i < this.state.requiredNumber; i++) {
            cosignerControls.push(i);
        }

        return (<View>
            {
                cosignerControls.map(c => {
                    return (<DagSelect label={('co-signer ' + c + ':').toUpperCase()}
                                       key={'co-signer ' + c}
                                       validators={[validators.required('Please select co-signer')]}
                                       onValueChange={(value) => {
                                           this.onCosignerChange(value, c);
                                       }}
                                       value={this.state.cosigners[c]}
                                       containerStyle={container.m20b}
                                       items={[
                                           {label: '-- Select co-signer --', value: ''},
                                           {label: 'Faucet(0JMV...)', value: '0JMVEW6BBLT26R5C66HRN7YAP2Z77XCX7'},
                                           {label: '[Add new co-signer device]', value: 'new-device'}
                                       ]}/>);
                })
            }
        </View>);
    }

    render() {
        return (
            <ScrollView>
                <BasePageLayout style={container.p30}>
                    <DagForm>
                        <DagTextInput value={this.state.walletName}
                                      label={'Wallet name'.toUpperCase()}
                                      placeholder={'New wallet'}
                                      validators={[validators.required()]}
                                      style={StyleSheet.flatten([container.m20b])}
                                      onValueChange={this.onWalletNameChange.bind(this)}/>

                        <Text style={StyleSheet.flatten([container.m20b, font.size14])}>
                            Single address wallets will not spawn new addresses for every transaction, change will
                            always go to the one and only address the wallet contains.
                        </Text>

                        <DagSwitch label={'Single address wallet'.toUpperCase()}
                                   containerStyle={container.m20b}
                                   value={this.state.isSingleAddress}
                                   onValueChange={this.onSingleAddressChange.bind(this)}/>

                        <DagSelect label={'total number of co-signers'.toUpperCase()}
                                   onValueChange={this.onTotalNumberChange.bind(this)}
                                   containerStyle={container.m20b}
                                   value={this.state.totalNumber}
                                   items={[
                                       {label: '2', value: '2'},
                                       {label: '3', value: '3'},
                                       {label: '4', value: '4'},
                                       {label: '5', value: '5'},
                                       {label: '6', value: '6'}
                                   ]}/>

                        <DagSelect label={'required number of signatures'.toUpperCase()}
                                   onValueChange={this.onRequiredNumberChange.bind(this)}
                                   containerStyle={container.m20b}
                                   value={this.state.requiredNumber}
                                   items={this.getRequiredCosigners()}/>

                        {this.renderCosigners()}

                        <DagButton type={'submit'}
                                   text={('create ' + this.state.requiredNumber + '-of-' + this.state.totalNumber + ' wallet').toUpperCase()}
                                   onClick={this.onCreateNewWalletClick.bind(this)}/>
                    </DagForm>
                </BasePageLayout>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({

});

export default MultiDeviceWallet;
