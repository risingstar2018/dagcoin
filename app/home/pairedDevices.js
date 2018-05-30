import React, {Component} from 'react';

import {
    StyleSheet, Text, View
} from 'react-native';

import {connect} from "react-redux";
import BasePageLayout from "../general/basePageLayout";
import HomeLayout, {MENU_ITEMS} from "./homeLayout";
import PageHeader from "../general/pageHeader";

class PairedDevices extends Component {
    constructor() {
        super();
    }

    render() {
        return (
            <HomeLayout selectedMenuItem={MENU_ITEMS.PAIRED_DEVICES}>
                <PageHeader color={'red'}
                            hasMenu={true}
                            title={this.props.walletName.toUpperCase()} />
                <BasePageLayout>
                    <Text>Paired Devices</Text>
                </BasePageLayout>
            </HomeLayout>
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

export default connect(mapStateToProps, mapDispatchToProps)(PairedDevices);
