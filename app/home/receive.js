import React, {Component} from 'react';

import {
    StyleSheet, Text, View, Clipboard, Platform, Image
} from 'react-native';

import {container, font, text} from "../styles/main";
import DagQrCode from "../controls/dagQrCode/dagQrCode";
import DagSimpleButton from "../controls/dagSimpleButton";
import {connect} from "react-redux";
import BasePageLayout from "../general/basePageLayout";
import DagModalManager from "../controls/dagModal/dagModalManager";
import RequestSpecificAmountModal from "../controls/dagModal/modals/requestSpecificAmountModal";
import DagToastManager, {POSITION} from "../controls/dagToast/dagToastManager";
import HomeLayout, {MENU_ITEMS} from "./homeLayout";
import PageHeader from "../general/pageHeader";

class Receive extends Component {
    constructor() {
        super();
    }

    onRequestSpecificAmount() {
        DagModalManager.show(<RequestSpecificAmountModal
            address={this.props.address}
            onCancel={DagModalManager.hide} />)
    }

    onQrCodeClick() {
        Clipboard.setString(this.props.address);
        DagToastManager.show("Copied!", POSITION.CENTER);
    }

    onShareButtonClick() {
        console.log('share');
    }

    renderCustomButton() {
        if (Platform.OS === "web"){
            return null;
        }

        return (
            <DagSimpleButton style={StyleSheet.flatten([container.p20])} onClick={this.onShareButtonClick.bind(this)}>
                <Image source={require('../../img/share-white.png')} style={styles.shareIcon} />
            </DagSimpleButton>
        );
    }

    render() {
        return (
            <HomeLayout selectedMenuItem={MENU_ITEMS.RECEIVE}>
                <PageHeader color={'red'}
                            hasMenu={true}
                            title={this.props.walletName.toUpperCase()}
                            renderCustomAction={this.renderCustomButton.bind(this)} />
                <BasePageLayout>
                    <View style={container.center}>
                        <Text>Tap the <Text style={font.weight700}>QR-code</Text> to copy its address.</Text>
                        <Text>Share it with the sender via email or text.</Text>
                        <DagSimpleButton style={container.m30} onClick={this.onQrCodeClick.bind(this)}>
                            <DagQrCode size={180} value={`${this.props.protocol}:${this.props.address}`} />
                        </DagSimpleButton>
                        <Text style={[font.size12, font.weight700]}>{this.props.address}</Text>
                        <DagSimpleButton onClick={this.onRequestSpecificAmount.bind(this)}>
                            <Text style={text.textRed}>Request a specific amount</Text>
                        </DagSimpleButton>
                    </View>
                </BasePageLayout>
            </HomeLayout>
        );
    }
}

const styles = StyleSheet.create({
    shareIcon: {
        width: 20,
        height: 20
    }
});

function mapStateToProps(state) {
    return {
        address: state.general.focusedWallet.address,
        walletName: state.general.focusedWallet.name,
        protocol: state.general.protocol
    }
}

const mapDispatchToProps = {

};

export default ReceiveWrapper = connect(mapStateToProps, mapDispatchToProps)(Receive);
