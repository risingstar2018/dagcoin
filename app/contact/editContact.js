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
import {connect} from "react-redux";
import {editContact} from "../actions/contactsActions";

class EditContact extends Component {
    constructor(props) {
        super(props);

        this.state = this.props.navParams.contact;
    }

    onSaveClick() {
        this.props.editContact(this.state);
        Navigator.back();
    }

    render() {
        return (
            <GeneralLayout style={StyleSheet.flatten([styles.container, this.props.style])}>
                <PageHeader canBack={true} title={'Edit contact'.toUpperCase()} />
                <BasePageLayout style={StyleSheet.flatten([container.p20, container.p15t, container.p15b])}>
                    <DagForm>
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
    editContact
};

export default connect(null, mapDispatchToProps)(EditContact);
