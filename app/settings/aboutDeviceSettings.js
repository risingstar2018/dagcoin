import React, {Component} from 'react';

import {
    StyleSheet
} from 'react-native';

import {container} from "../styles/main";
import DagListView from "../controls/dagListView/dagListView";
import SettingsPageLayout from "./settingsPageLayout";
import {connect} from "react-redux";

class AboutDeviceSettings extends Component {
    constructor() {
        super();
    }

    render() {
        const options = [
            {
                title: 'Device address',
                description: this.props.address
            }
        ];

        return (
            <SettingsPageLayout canBack={true} title={'About Device'.toUpperCase()}>
                <DagListView style={container.m10b} options={options}/>
            </SettingsPageLayout>
        );
    }
}

const styles = StyleSheet.create({

});

function mapStateToProps(state) {
    return {
        address: state.general.deviceAddress
    }
}

export default AboutDeviceSettingsWrapper = connect(mapStateToProps, null)(AboutDeviceSettings);
