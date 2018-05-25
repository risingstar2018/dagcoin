import React, {Component} from 'react';

import {
    StyleSheet, Text, View
} from 'react-native';

import {connect} from "react-redux";
import BasePageLayout from "../../general/basePageLayout";
import HomeLayout, {MENU_ITEMS} from "../homeLayout";
import PageHeader from "../../general/pageHeader";
import BuyDags from "./buyDags";
import WalletInfo from "./walletInfo";

class Wallet extends Component {
    constructor() {
        super();
    }

    renderContent() {
        if (this.props.transactions.length === 0) {
            return (<BuyDags/>);
        }

        return (<WalletInfo/>);
    }

    render() {
        return (
            <HomeLayout selectedMenuItem={MENU_ITEMS.WALLET}>
                <PageHeader color={'red'}
                            hasMenu={true}
                            title={this.props.walletName.toUpperCase()} />
                {this.renderContent()}
            </HomeLayout>
        );
    }
}

const styles = StyleSheet.create({

});

function mapStateToProps(state) {
    return {
        address: state.general.focusedWallet.address,
        walletName: state.general.focusedWallet.name,
        transactions: state.general.focusedWallet.transactions
    }
}

const mapDispatchToProps = {

};

export default WalletWrapper = connect(mapStateToProps, mapDispatchToProps)(Wallet);
