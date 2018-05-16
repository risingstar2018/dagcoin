import React, {Component} from 'react';

import {
    StyleSheet, View, Text, Image, Platform
} from 'react-native';

import {container, font, heading, text} from "../../../styles/main";
import DagModal from "../dagModal";
import DagQrCode from "../../dagQrCode/dagQrCode";
import DagSimpleButton from "../../dagSimpleButton";
import {connect} from "react-redux";
import DagInlineImage from "../../dagInlineImage";

class RequestSpecificAmountDetailsModal extends Component {
    constructor() {
        super();

        this.state = {
            amount: ''
        };
    }

    renderShareButton() {
        if (Platform.OS === 'web') {
            return;
        }

        return (
            <View style={[container.m30b, container.center]}>
                <DagSimpleButton style={[container.p10b, container.p10t, container.p20l, container.p20r, styles.shareButton]}>
                    <Text style={[text.textGray, font.size11]}>
                        {'share address'.toUpperCase()} <DagInlineImage style={[styles.shareIcon]} source={require('./../../../../img/share-gray.png')} />
                    </Text>
                </DagSimpleButton>
            </View>
        );
    }

    render() {
        const qrCodeValue = `${this.props.protocol}:${this.props.address}?amount=${this.props.amount}`;

        return (
            <DagModal onClose={this.props.onCancel}
                      style={StyleSheet.flatten([container.p20, container.m20t])}>
                <View style={[styles.container]}>
                    <Text style={StyleSheet.flatten([heading.h3, container.m3b])}>
                        Request specific amount
                    </Text>

                    <View style={[styles.title, container.p15]}>
                        <Text style={[font.size11, font.weight700, styles.titleText]}>{'QR code'.toUpperCase()}</Text>
                    </View>

                    <DagQrCode style={[container.center, container.m30]}
                               value={qrCodeValue}/>

                    {this.renderShareButton()}

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

RequestSpecificAmountDetailsModal.defaultProps = {
    onCancel: () => { },
};

const styles = StyleSheet.create({
    container: {
        flex: 1
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
    },
    shareIcon: {
        width: 9,
        height: 9
    }
});

function mapStateToProps(state) {
    return {
        protocol: state.general.protocol
    }
}

export default RequestSpecificAmountDetailsModalWrapper = connect(mapStateToProps, null)(RequestSpecificAmountDetailsModal);
