import React, { Component } from 'react';

import {
    StyleSheet, Image
} from 'react-native';
import DagIconButton from "./dagIconButton";
import {container} from "../styles/main";

class DagQrCodeButton extends Component {
    constructor() {
        super();
    }

    onQrCodeScanClick() {
        console.log('open qr code scan');
    }

    render() {
        return (
            <DagIconButton style={StyleSheet.flatten([container.p20])} onClick={this.onQrCodeScanClick.bind(this)}>
                <Image style={styles.menuIcon} style={styles.image} source={require('../../img/barcode-scan.png')}></Image>
            </DagIconButton>
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
