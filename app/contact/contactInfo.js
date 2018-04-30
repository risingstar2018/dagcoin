import React, {Component} from 'react';

import {
    StyleSheet, Image
} from 'react-native';

import GeneralLayout from "../general/generalLayout";
import PageHeader from "../general/pageHeader";
import BasePageLayout from "../general/basePageLayout";
import DagForm, { validators } from "../controls/dagForm";
import DagTextInput from "../controls/dagTextInput";
import DagButton from "../controls/dagButton";

import {container} from "../styles/main";
import DagIconButton from "../controls/dagIconButton";
import DagQrCodeButton from "../controls/dagQrCodeButton";

class NewContact extends Component {
    constructor() {
        super();

        this.state = {
            walletName: '',
            firstName: '',
            lastName: '',
            email: '',
            description: ''
        };
    }

    onSaveClick() {
        console.log(this.state);
    }

    onQrCodeScan() {

    }

    renderQrCodeButton() {
        return (<DagQrCodeButton onScan={this.onQrCodeScan.bind(this)}/>);
    }

    render() {
        return (
            <GeneralLayout style={StyleSheet.flatten([styles.container, this.props.style])}>
                <PageHeader canBack={true} title={'New contact'.toUpperCase()} renderCustomAction={this.renderQrCodeButton.bind(this)}></PageHeader>
                <BasePageLayout style={StyleSheet.flatten([container.p20, container.p15t, container.p15b])}>
                    <DagForm>
                        <DagTextInput label={'Wallet address'.toUpperCase()}
                                      validators={[
                                          validators.required(),
                                          validators.validWalletAddress(),
                                          validators.maxLength(32)
                                      ]}
                                      value={this.state.walletName}
                                      style={container.m15b}
                                      required={true}
                                      maxLength={32}
                                      onValueChange={(value) => {this.setState({walletName: value})}}/>

                        <DagTextInput label={'First Name'.toUpperCase()}
                                      validators={[
                                          validators.required(),
                                          validators.maxLength(50)
                                      ]}
                                      value={this.state.firstName}
                                      style={container.m15b}
                                      required={true}
                                      maxLength={50}
                                      onValueChange={(value) => {this.setState({firstName: value})}}/>

                        <DagTextInput label={'Last Name'.toUpperCase()}
                                      validators={[
                                          validators.maxLength(50)
                                      ]}
                                      value={this.state.lastName}
                                      style={container.m15b}
                                      maxLength={50}
                                      onValueChange={(value) => {this.setState({lastName: value})}}/>

                        <DagTextInput label={'E-Mail'.toUpperCase()}
                                      validators={[
                                          validators.validEmail(),
                                          validators.maxLength(254)
                                      ]}
                                      maxLength={254}
                                      value={this.state.email}
                                      style={container.m15b}
                                      onValueChange={(value) => {this.setState({email: value})}}/>

                        <DagTextInput label={'Description'.toUpperCase()}
                                      validators={[
                                          validators.maxLength(300)
                                      ]}
                                      maxLength={300}
                                      value={this.state.description}
                                      style={container.m15b}
                                      multiline={true}
                                      onValueChange={(value) => {this.setState({description: value})}}/>

                        <DagButton onClick={this.onSaveClick.bind(this)}
                                   text={'Save'.toUpperCase()}
                                   type={'submit'}/>
                    </DagForm>
                </BasePageLayout>
            </GeneralLayout>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});

export default NewContact;
