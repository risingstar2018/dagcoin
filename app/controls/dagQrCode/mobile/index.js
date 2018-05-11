import React, { Component } from 'react';
import QRCode from 'react-native-qrcode-svg';

import {
    StyleSheet
} from 'react-native';

class DagQrCodeMobile extends Component {
    constructor() {
        super();
    }

    render() {
        const logo = this.props.logo ? this.props.logo : null;

        return (
            <QRCode value={this.props.value}
                    color={this.props.color}
                    backgroundColor={this.props.backgroundColor}
                    logo={logo}
                    size={this.props.size}
                    />
        );
    }
}

const styles = StyleSheet.create({

});

export default DagQrCodeMobile;
