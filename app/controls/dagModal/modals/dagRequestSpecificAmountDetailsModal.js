import React, {Component} from 'react';

import {
    StyleSheet, View, Text, Image
} from 'react-native';

import {container, font, text} from "../../../styles/main";
import DagModal from "../dagModal";
import DagQrCode from "../../dagQrCode/dagQrCode";
import DagSimpleButton from "../../dagSimpleButton";

class DagRequestSpecificAmountDetailsModal extends Component {
    constructor() {
        super();

        this.state = {
            amount: ''
        };
    }

    render() {
        const qrCodeValue = JSON.stringify({address: this.props.address, amount: this.props.amount});

        return (
            <DagModal onClose={this.props.onCancel}
                      style={StyleSheet.flatten([container.p20, container.m20t])}>
                <View style={[styles.container]}>
                    <Text style={StyleSheet.flatten([font.size16, font.weight600, styles.header, text.textCenter])}>
                        Request specific amount
                    </Text>

                    <View style={[styles.title, container.p15]}>
                        <Text style={[font.size11, font.weight700, styles.titleText]}>{'QR code'.toUpperCase()}</Text>
                    </View>

                    <DagQrCode style={[container.center, container.m30]}
                               value={qrCodeValue}/>

                    <View style={[container.m30b, container.center]}>
                        <DagSimpleButton style={[container.p10b, container.p10t, container.p20l, container.p20r, styles.shareButton]}>
                            <Text style={[text.textGray, font.size11]}>{'share address'.toUpperCase()}</Text>
                        </DagSimpleButton>
                    </View>

                    <View style={[styles.title, container.p15]}>
                        <Text style={[font.size11, font.weight700, styles.titleText]}>{'Details'.toUpperCase()}</Text>
                    </View>

                    <View style={StyleSheet.flatten([container.p15, styles.infoContainer])}>
                        <Text style={StyleSheet.flatten([text.textGray, font.size14, container.m5b])}>Address:</Text>
                        <Text numberOfLines={1}>{this.props.address}</Text>
                    </View>

                    <View style={StyleSheet.flatten([container.p15, styles.infoContainer])}>
                        <Text style={StyleSheet.flatten([text.textGray, font.size14, container.m5b])}>Amount:</Text>
                        <Text>{this.props.amount} DAG</Text>
                    </View>
                </View>
            </DagModal>
        );
    }
}

DagRequestSpecificAmountDetailsModal.defaultProps = {
    onCancel: () => { },
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    header: {
        color: '#34404c'
    },
    infoContainer: {
        borderStyle: 'solid',
        borderTopColor: 'transparent',
        borderBottomColor: '#eeeeee',
        borderTopWidth: 1,
        borderBottomWidth: 1
    },
    title: {
        backgroundColor: '#f1f3f5'
    },
    titleText: {
        color: '#2c3e50'
    },
    shareButton: {
        borderStyle: 'solid',
        borderRadius: 40,
        borderColor: '#a5b2bf',
        borderWidth: 1
    }
});

export default DagRequestSpecificAmountDetailsModal;

