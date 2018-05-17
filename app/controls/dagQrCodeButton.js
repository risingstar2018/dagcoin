import React, { Component } from 'react';

import {
    StyleSheet, Image
} from 'react-native';
import DagSimpleButton from "./dagSimpleButton";
import {container} from "../styles/main";
import DagSvg from "../controls/dagSvg/dagSvg";

class DagQrCodeButton extends Component {
    constructor() {
        super();
    }

    onQrCodeScanClick() {
        console.log('open qr code scan');
    }

    render() {
        return (
            <DagSimpleButton style={StyleSheet.flatten([container.p20])} onClick={this.onQrCodeScanClick.bind(this)}>
                <DagSvg width={30}
                        height={30}
                        source={require('../../svg/barcode-scan.svg')}
                        fill={'#d51f26'}
                        style={styles.menuIcon}
                />
            </DagSimpleButton>
        );
    }
}

const styles = StyleSheet.create({
    image: {
        width: 30,
        height: 30,
        alignSelf: 'flex-end'
    }
});

export default DagQrCodeButton;
