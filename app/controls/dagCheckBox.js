import React, {Component} from 'react';

import CheckBox from 'react-native-checkbox';
import {StyleSheet, Text, View} from 'react-native';
import DagFormControl, {LABEL_POSITION} from "./dagFormControl";
import {font} from "../styles/main";

class DagCheckBox extends Component {
    constructor(){
        super();
    }

    onClick() {
        this.props.onValueChange(!this.props.value)
    }

    render() {
        return (
            <DagFormControl {...this.props}
                            labelPosition={LABEL_POSITION.RIGHT}
                            onLabelClick={this.onClick.bind(this)}
                            inlineContainerStyle={styles.inlineContainer}
                            labelStyle={StyleSheet.flatten([font.size11, this.props.labelStyle])}>
                <CheckBox
                    checkedImage = {require('../../img/check_box.png')}
                    uncheckedImage = {require('../../img/check_box_outline_blank.png')}
                    onChange={this.onClick.bind(this)}
                    checked={this.props.value}
                    checkboxStyle={StyleSheet.flatten([styles.checkbox, this.props.checkboxStyle])}
                    label=''
                    containerStyle = {StyleSheet.flatten([this.props.checkBoxContainerStyle])}
                />
            </DagFormControl>
        );
    }
}

const styles = StyleSheet.create({
    inlineContainer: {
        alignItems: 'flex-start'
    },
    checkbox: {
        width: 20,
        height: 20
    }
});

export default DagCheckBox;
