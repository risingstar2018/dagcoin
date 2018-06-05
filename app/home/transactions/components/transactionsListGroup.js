import React, {Component} from 'react';

import {
    StyleSheet, View, Text
} from 'react-native';

import {font, text} from "../../../styles/main";

class TransactionsListGroup extends Component {
    render() {
        return (
            <View style={StyleSheet.flatten([styles.container])}>
                <Text style={StyleSheet.flatten([text.textGray, font.weight700])}>{this.props.title}</Text>
            </View>
        );
    }
}

TransactionsListGroup.defaultProps = {
    title: ''
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderColor: '#eeeeee',
        borderTopStyle: 'solid',
        borderTopWidth: 1,
        paddingLeft: 15,
        paddingTop: 3,
        paddingBottom: 3
    }
});

export default TransactionsListGroup;