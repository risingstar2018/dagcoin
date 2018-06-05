import React, {Component} from 'react';

import {
    StyleSheet, View, Text, Image
} from 'react-native';

import {container, font, text} from "../../../styles/main";

class TransactionListItem extends Component {
    render() {
        const { transaction } = this.props;

        const img = transaction.type === 'receive' ? require('../../../../img/receive.png') : require('../../../../img/send.png');

        return (
            <View style={StyleSheet.flatten([styles.container, this.props.last ? styles.last : null])}>
                <View style={StyleSheet.flatten([styles.iconContainer, container.m15l, container.m15r])}>
                    <Image source={img} style={StyleSheet.flatten([styles.icon])}/>
                </View>
                <View>
                    <Text style={StyleSheet.flatten([font.size14, styles.transactionType])}>
                        {transaction.type === 'receive' ? 'Receive' : 'Send'}
                    </Text>
                    <Text style={StyleSheet.flatten([font.size10, text.textGray])}>
                        {transaction.address}
                    </Text>
                </View>
                <View style={StyleSheet.flatten([styles.sumContainer])}>
                    <Text style={StyleSheet.flatten(
                        [
                            font.size14,
                            styles.transactionType,
                            transaction.type === 'receive' ? styles.receiveColor : styles.sendColor
                        ]
                    )}>
                        {(transaction.type === 'receive' ? '+' : '-') + transaction.sum}
                    </Text>
                    <Text style={StyleSheet.flatten([font.size10, text.textGray])}>
                        {transaction.time}
                    </Text>
                </View>
                <Image source={require('../../../../img/arrow-right.png')} style={StyleSheet.flatten([styles.infoIcon])}/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderTopColor: '#eeeeee',
        borderTopWidth: 1,
        borderStyle: 'solid',
        alignItems: 'center',
        paddingTop: 3,
        paddingBottom: 3
    },
    starIcon: {
        width: 24,
        height: 24
    },
    iconContainer: {
        borderRadius: 40,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#c2c6ca',
        backgroundColor: '#ffffff'
    },
    icon: {
        width: 16,
        height: 16,
        margin: 8
    },
    infoIcon: {
        width: 10,
        height: 16,
        marginLeft: 5,
        marginRight: 15
    },
    last: {
        borderBottomWidth: 0
    },
    transactionType: {
        marginBottom: 5
    },
    sumContainer: {
        marginLeft: 'auto',
        marginRight: 15,
        textAlign: 'right'
    },
    sendColor: {
        color: '#ffa500'
    },
    receiveColor: {
        color: '#48be18'
    }
});

export default TransactionListItem;
