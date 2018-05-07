import React, { Component } from 'react';

import {
    StyleSheet, TouchableOpacity, View, Text
} from 'react-native';
import {container} from "../styles/main";

class DagFile extends Component {
    render() {
        return (
            <TouchableOpacity
                onPress={() => this.props.onClick()}
                style={StyleSheet.flatten([styles.container, container.p15, this.props.style])}
                disabled={this.props.disabled}
            >
                <Text>Choose file</Text>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 5,
        shadowRadius: 2,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#ccc'
    },
    text: {
        textAlign: 'center',
        color: '#ccc',
        fontWeight: '600'
    }
});

export default DagFile;
