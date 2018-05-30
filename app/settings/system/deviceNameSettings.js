import React, {Component} from 'react';

import {
    StyleSheet, Text, View
} from 'react-native';

import {container, text, font} from "../../styles/main";
import SettingsPageLayout from "../settingsPageLayout";
import DagButton from "../../controls/dagButton";
import DagTextInput from "../../controls/dagTextInput";
import {validators} from "../../controls/dagForm";
import DagForm from "../../controls/dagForm";
import {connect} from "react-redux";
import {changeDeviceName} from "../../actions/generalActions";
import Navigator from "../../navigator/navigationManager";

class DeviceNameSettings extends Component {
    constructor() {
        super();

        this.state = {
            deviceName: ''
        };
    }

    onSaveClick() {
        this.props.changeDeviceName(this.state.deviceName);
        Navigator.back();
    }

    componentWillMount() {
        this.setState({
            deviceName: this.props.deviceName
        });
    }

    render() {
        return (
            <SettingsPageLayout canBack={true} title={'Device Name'.toUpperCase()}>
                <View style={styles.container}>
                    <View style={StyleSheet.flatten([styles.controlsContainer, container.p40t, container.p40l, container.p40r, container.m20b])}>

                        <DagForm>
                            <DagTextInput label={'Device name'} validators={[validators.required()]}
                                          containerStyle={StyleSheet.flatten([container.m20b])}
                                          onValueChange={(value) => this.setState({deviceName: value})}
                                          value={this.state.deviceName}/>
                            <DagButton text={"SAVE"} type={'submit'} onClick={this.onSaveClick.bind(this)}/>
                        </DagForm>
                    </View>

                    <Text style={StyleSheet.flatten([text.textGray, font.weight700, font.size11])}>Device name is
                        visible to other devices you communicate with.</Text>
                </View>
            </SettingsPageLayout>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center'
    },
    controlsContainer: {
        alignSelf: 'stretch'
    }
});

function mapStateToProps(state) {
    return {
        deviceName: state.general.deviceName
    }
}

const mapDispatchToProps = {
    changeDeviceName: changeDeviceName
};

export default connect(mapStateToProps, mapDispatchToProps)(DeviceNameSettings);

