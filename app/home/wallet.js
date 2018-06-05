import React, { Component } from 'react';

import {
  StyleSheet, Text, ScrollView, View, Image
} from 'react-native';

import {connect} from "react-redux";
import HomeLayout, {MENU_ITEMS} from "./homeLayout";
import PageHeader from "../general/pageHeader";
import Transactions from "./transactions/transactions";
import BalanceAmount from './components/balanceAmount';

import {font, text} from "../styles/main";

class Wallet extends Component {
    constructor() {
        super();
    }

    render() {
        return (
            <HomeLayout
                selectedMenuItem={MENU_ITEMS.WALLET}
            >
                <PageHeader
                    color={'red'}
                    hasMenu={true}
                    title={this.props.walletName.toUpperCase()}
                />
                <BalanceAmount/>
                <View style={StyleSheet.flatten([styles.transactionsHeader])}>
                    <View>
                        <Text style={StyleSheet.flatten([font.weight700, font.size12])}>{'transactions history'.toUpperCase()}</Text>
                    </View>
                    <View style={StyleSheet.flatten([styles.exportContainer])}>
                        <Image source={require('../../img/content-copy.png')} style={StyleSheet.flatten([styles.copyIcon])}/>
                        <Text style={StyleSheet.flatten([font.weight700, font.size12, text.textRed])}>{'export to csv'.toUpperCase()}</Text>
                    </View>
                </View>
                <ScrollView style={styles.transactions}>
                    <Transactions/>
                </ScrollView>
            </HomeLayout>
        );
    }
}

const styles = StyleSheet.create({
    wallet: {
        flex: 1
    },
    transactions: {
        marginBottom: 50,
        flex: 1
    },
    transactionsHeader: {
        backgroundColor: '#ffffff',
        padding: 15,
        flexDirection: 'row'
    },
    exportContainer: {
        paddingRight: 15,
        marginLeft: 'auto',
        flexDirection: 'row',
        alignItems: 'center'
    },
    copyIcon: {
        width: 16,
        height: 16,
        marginRight: 5
    }
});

function mapStateToProps(state) {
    return {
        address: state.general.focusedWallet.address,
        walletName: state.general.focusedWallet.name,
        transactions: state.transactions
    }
}

const mapDispatchToProps = {

};

export default WalletWrapper = connect(mapStateToProps, mapDispatchToProps)(Wallet);
