import React, {Component} from 'react';

import {
    StyleSheet
} from 'react-native';

import GeneralLayout from "../general/generalLayout";
import PageHeader from "../general/pageHeader";
import BasePageLayout from "../general/basePageLayout";
import DagForm, { validators } from "../controls/dagForm";
import DagTextInput from "../controls/dagTextInput";
import DagButton from "../controls/dagButton";
import Navigator from "../navigator/navigationManager";

import {container} from "../styles/main";
import DagQrCodeButton from "../controls/dagQrCodeButton";
import {connect} from "react-redux";
import {addContact} from "../actions/contactsActions";

class NewContact extends Component {
    constructor() {
        super();

        this.state = {
            address: '',
            firstName: '',
            lastName: '',
            email: '',
            description: '',
            isFavorite: false
        };
    }

    onSaveClick() {
        this.props.addContact(this.state);
        Navigator.back();
    }

    onQrCodeScan() {
        console.log('qrcode-scan');
    }

    renderQrCodeButton() {
        return (<DagQrCodeButton onScan={this.onQrCodeScan.bind(this)}/>);
    }

    render() {
        return (
            <GeneralLayout style={StyleSheet.flatten([styles.container, this.props.style])}>
                <PageHeader canBack={true} title={'New contact'.toUpperCase()} renderCustomAction={this.renderQrCodeButton.bind(this)} />
                <BasePageLayout style={StyleSheet.flatten([container.p20, container.p15t, container.p15b])}>
                    <DagForm>
                        <DagTextInput label={'Wallet address'.toUpperCase()}
                                      validators={[
                                          validators.required(),
                                          validators.validWalletAddress(),
                                          validators.maxLength(32)
                                      ]}
                                      value={this.state.address}
                                      containerStyle={container.m15b}
                                      required={true}
                                      maxLength={32}
                                      onValueChange={(value) => {this.setState({address: value})}}/>

                        <DagTextInput label={'First Name'.toUpperCase()}
                                      validators={[
                                          validators.required(),
                                          validators.maxLength(50)
                                      ]}
                                      value={this.state.firstName}
                                      containerStyle={container.m15b}
                                      required={true}
                                      maxLength={50}
                                      onValueChange={(value) => {this.setState({firstName: value})}}/>

                        <DagTextInput label={'Last Name'.toUpperCase()}
                                      validators={[
                                          validators.maxLength(50)
                                      ]}
                                      value={this.state.lastName}
                                      containerStyle={container.m15b}
                                      maxLength={50}
                                      onValueChange={(value) => {this.setState({lastName: value})}}/>

                        <DagTextInput label={'E-Mail'.toUpperCase()}
                                      validators={[
                                          validators.validEmail(),
                                          validators.maxLength(254)
                                      ]}
                                      maxLength={254}
                                      value={this.state.email}
                                      containerStyle={container.m15b}
                                      onValueChange={(value) => {this.setState({email: value})}}/>

                        <DagTextInput label={'Description'.toUpperCase()}
                                      validators={[
                                          validators.maxLength(300)
                                      ]}
                                      maxLength={300}
                                      value={this.state.description}
                                      containerStyle={container.m15b}
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

const mapDispatchToProps = {
    addContact
};

export default NewContactWrapper = connect(null, mapDispatchToProps)(NewContact);
