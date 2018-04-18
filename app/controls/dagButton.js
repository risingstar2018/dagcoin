import React, { Component } from 'react';

import {
    StyleSheet, TouchableOpacity, View, Text
} from 'react-native';
import {container} from "../styles/main";

class DagButton extends Component {
    constructor() {
        super();

        this.renderContent = this.renderContent.bind(this);
    }

    renderContent() {
        if (this.props.children) {
            return this.props.children;
        } else {
            return (<Text style={StyleSheet.flatten([styles.button, container.p15, this.props.style, this.props.disabled ? styles.disabled : styles.enabled])}>
                { this.props.buttonText }
                </Text>);
        }
    }

    render() {
        return (
            <TouchableOpacity onPress={() => this.props.onClick()}
                              disabled={this.props.disabled}>
                {this.renderContent()}
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#a8191e',
        textAlign: 'center',
        color: '#fff',
        fontWeight: '600',
        borderRadius: 5,
        shadowRadius: 2
    },
    enabled: {
        shadowColor: '#d51f26',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
    },
    disabled: {
        backgroundColor: '#ccc',
        shadowRadius: 0
    }
});

export default DagButton;
