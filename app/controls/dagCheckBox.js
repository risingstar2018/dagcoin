import React, {Component} from 'react';

import CheckBox from 'react-native-checkbox';
import {StyleSheet, Text, View} from 'react-native';

class DagCheckBox extends Component {
    constructor(){
        super();
    }

    onClick() {
        this.props.onValueChange(!this.props.value)
    }

    render() {
        return (
            <View style={styles.container}>
                <CheckBox
                    checkedImage = {require('../../img/check_box.png')}
                    uncheckedImage = {require('../../img/check_box_outline_blank.png')}
                    onChange={this.onClick.bind(this)}
                    checked={this.props.value}
                    label=''
                    checkboxStyle={StyleSheet.flatten([styles.checkbox, this.props.checkboxStyle])}
                    containerStyle = {StyleSheet.flatten([styles.checkBoxContainer, this.props.checkboxContainer])}
                />
                <Text onPress={this.onClick.bind(this)} style={StyleSheet.flatten([styles.label, this.props.labelStyle])}>
                    {this.props.label}
                </Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({

    label: {
        color: '#000',
        marginTop: 5
    },
    container: {
        flexDirection: 'row',
        paddingBottom: 20
    },
    checkBoxContainer: {
    },
    checkBox: {
    }
});

export default DagCheckBox;
