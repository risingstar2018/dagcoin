import React, { Component } from 'react';
import QRCode from 'react-native-qrcode-svg';

import {
    StyleSheet, Platform, View
} from 'react-native';

class DagQrCode extends Component {
    constructor() {
        super();
    }

    render() {
        return (
            <View style={this.props.style}>
                <QRCode value={this.props.value}
                        color={this.props.color}
                        backgroundColor={this.props.backgroundColor}
                        logo={this.props.logo}
                        size={this.props.size}
                />
            </View>
        );
    }
}

DagQrCode.defaultProps = {
    value: '',
    color: '#d51f26',
    backgroundColor: '#ffffff',
    logo: require('../../../img/dagcoin_35x35.png'),
    size: 180
};

const styles = StyleSheet.create({

});

export default DagQrCode;
