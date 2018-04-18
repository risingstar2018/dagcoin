import React, { Component } from 'react';

import {
    StyleSheet, TouchableOpacity, Text
} from 'react-native';
import {container} from "../styles/main";

class Button extends Component {
    render() {
        return (
            <TouchableOpacity onPress={() => this.props.onClick()}
                              disabled={this.props.disabled}>
                <Text style={StyleSheet.flatten([styles.button, container.p0, this.props.style, this.props.disabled ? styles.disabled : styles.enabled])}>{ this.props.buttonText }</Text>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#a8191e',
        shadowColor: '#d51f26',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        textAlign: 'center',
        color: '#fff',
        fontWeight: '600',
        borderRadius: 10,
        width: 10,
        height: 10
    },
    enabled: {
        backgroundColor: '#a8191e',
    },
    disabled: {
        shadowRadius: 0
    }
});

export default Button;
