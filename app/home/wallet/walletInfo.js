import React, {Component} from 'react';

import {
    StyleSheet, Text, View
} from 'react-native';

import {connect} from "react-redux";
import BasePageLayout from "../../general/basePageLayout";

class WalletInfo extends Component {
    constructor() {
        super();
    }

    render() {
        return (
            <BasePageLayout>
                <Text>Wallet</Text>
            </BasePageLayout>
        );
    }
}

const styles = StyleSheet.create({

});

function mapStateToProps(state) {
    return {
        address: state.general.focusedWallet.address,
        walletName: state.general.focusedWallet.name
    }
}

const mapDispatchToProps = {

};

export default WalletInfoWrapper = connect(mapStateToProps, mapDispatchToProps)(WalletInfo);
