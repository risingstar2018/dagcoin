import React, { Component } from 'react';

import { StyleSheet, Image } from 'react-native';
import DagSimpleButton from './dagSimpleButton';
import { container } from '../styles/main';

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
        <Image style={styles.menuIcon} style={styles.image} source={require('../../img/barcode-scan.png')} />
      </DagSimpleButton>
    );
  }
}

const styles = StyleSheet.create({
  image: {
    width: 30,
    height: 30,
    alignSelf: 'flex-end',
  },
});

export default DagQrCodeButton;
