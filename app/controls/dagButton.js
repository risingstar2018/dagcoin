import React, { Component } from 'react';
import LinearGradient from 'react-native-linear-gradient';

import {
    StyleSheet, TouchableOpacity, View, Text
} from 'react-native';
import {container, button, font} from "../styles/main";

class DagButton extends Component {
    constructor() {
        super();

        this.renderContent = this.renderContent.bind(this);
    }

    renderContent() {
        if (this.props.children) {
            return this.props.children;
        } else {
            return (<Text style={StyleSheet.flatten([styles.text, button.text, this.props.textStyle])}>
                { this.props.text }
                </Text>);
        }
    }

    render() {
        const gradientColors = this.props.disabled
            ? ['#ccc', '#ccc']
            : ['#d51f26', '#a8191e'];

        return (
            <LinearGradient
                style={StyleSheet.flatten([
                    styles.container,
                    container.p15,
                    this.props.disabled ? styles.disabled : styles.enabled,
                    this.props.style])}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 1 }}
                colors={gradientColors} >
                <TouchableOpacity style={container.flex}
                                  onPress={() => this.props.onClick()}
                                  disabled={this.props.disabled}>
                        {this.renderContent()}
                </TouchableOpacity>
            </LinearGradient>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 5,
        shadowRadius: 2
    },
    text: {
        color: '#fff'
    },
    enabled: {
        shadowColor: '#d51f26',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
    },
    disabled: {
        shadowRadius: 0
    }
});

export default DagButton;
