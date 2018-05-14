import React, {Component} from 'react';

import {
    StyleSheet, Text, View, Clipboard
} from 'react-native';

import {container, font, text} from "../styles/main";
import DagQrCode from "../controls/dagQrCode/dagQrCode";
import DagSimpleButton from "../controls/dagSimpleButton";
import {connect} from "react-redux";
import BasePageLayout from "../general/basePageLayout";
import DagModalManager from "../controls/dagModal/dagModalManager";
import DagRequestSpecificAmountModal from "../controls/dagModal/modals/dagRequestSpecificAmountModal";
import DagToastManager, {POSITION} from "../controls/dagToast/dagToastManager";

class Receive extends Component {
    constructor() {
        super();
    }

    onRequestSpecificAmount() {
        DagModalManager.show(<DagRequestSpecificAmountModal
            address={this.props.address}
            onCancel={DagModalManager.hide} />)
    }

    onQrCodeClick() {
        Clipboard.setString(this.props.address);
        DagToastManager.show("Copied!", POSITION.CENTER);
    }

    render() {
        return (
            <BasePageLayout>
                <View style={container.center}>
                    <Text>Tap the <Text style={font.weight700}>QR-code</Text> to copy its address.</Text>
                    <Text>Share it with the sender via email or text.</Text>
                    <DagSimpleButton style={container.m30} onClick={this.onQrCodeClick.bind(this)}>
                        <DagQrCode size={180} value={this.props.address} />
                    </DagSimpleButton>
                    <Text style={[font.size12, font.weight700]}>{this.props.address}</Text>
                    <DagSimpleButton onClick={this.onRequestSpecificAmount.bind(this)}>
                        <Text style={text.textRed}>Request a specific amount</Text>
                    </DagSimpleButton>
                </View>
            </BasePageLayout>
        );
    }
}

function mapStateToProps(state) {
    return {
        address: state.general.focusedWallet.address
    }
}

const mapDispatchToProps = {

};

export default ReceiveWrapper = connect(mapStateToProps, mapDispatchToProps)(Receive);
