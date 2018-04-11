import React, { Component } from 'react';

import {
    StyleSheet, TouchableOpacity, View, Text
} from 'react-native';

class DagButton extends Component {
    render() {
        return (
            <TouchableOpacity onPress={() => this.props.onClick()}
                              disabled={this.props.disabled}>
                <View>
                    <Text style={StyleSheet.flatten([styles.button, this.props.disabled ? styles.buttonDisabled : styles.buttonEnabled])}>{ this.props.buttonText }</Text>
                </View>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    button: {
        color: '#fff',
        padding: 15,
        textAlign: 'center',
        fontWeight: '600',
        borderRadius: 5,
    },
    buttonEnabled: {
        backgroundColor: '#a8191e',
        shadowColor: '#a8191e',
        shadowOffset: { width: 1, height: -1 },
        shadowOpacity: 0.8,
        shadowRadius: 2
    },
    buttonDisabled: {
        backgroundColor: '#ccc'
    }
});

export default DagButton;
