import React, {Component} from 'react';

import {
    StyleSheet, View, Text, Image
} from 'react-native';

import {container, font, text} from "../../../styles/main";

class NoTransactions extends Component {
    constructor() {
        super();
    }

    render() {
        return (
            <View
                style={StyleSheet.flatten([styles.container])}
            >
                <View
                    style={StyleSheet.flatten([styles.contentContainer, container.p30, container.p40b])}
                >
                    <Text
                        style={StyleSheet.flatten([container.m20b, text.textGray, text.textCenter])}
                    >
                        No transactions.
                    </Text>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f1f1'
    },
    contentContainer: {
        backgroundColor: '#ffffff',
        alignItems: 'center',
        borderRadius: 10
    }
});

export default NoTransactions;
