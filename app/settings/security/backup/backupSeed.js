import React, { Component } from 'react';

import { StyleSheet, View, Text, Platform } from 'react-native';
import BasePageLayout from '../../../general/basePageLayout';
import { container, font, text } from '../../../styles/main';
import DagButton from '../../../controls/dagButton';

class BackupSeed extends Component {
  constructor() {
    super();

    this.state = {
      isMnemonicExpanded: false,
      words: 'express give flat address document element pink monitor minute steak oxygen desert',
      isWordsDeleted: false,
    };

    this.renderText = this.renderText.bind(this);
    this.renderWalletSeed = this.renderWalletSeed.bind(this);
    this.renderMnemonic = this.renderMnemonic.bind(this);
  }

  onDeleteWordsClick() {
    this.setState({
      words: '',
      isWordsDeleted: true,
    });
  }

  onMnemonicToggle() {
    this.setState({
      isMnemonicExpanded: !this.state.isMnemonicExpanded,
    });
  }

  renderText() {
    let textInfo = '';

    if (Platform.OS !== 'web') {
      textInfo = 'To protect your funds, please use multisig wallets with redundancy, ' +
                'e.g. 1-of-2 wallet with one key on this device and another key on your laptop computer. ' +
                'Just the wallet seed is not enough.';
    } else {
      const appDataDir = 'C://test/stub';
      textInfo = `To restore your wallets, you will need a full backup of Dagcoin data at ${appDataDir}. ` +
                'Better yet, use multisig wallets with redundancy, ' +
                'e.g. 1-of-2 wallet with one key on this device and another key on your smartphone. ' +
                'Just the wallet seed is not enough.';
    }

    return (<Text style={text.textGray}>
      {textInfo}
    </Text>);
  }

  renderMnemonic() {
    if (this.state.isMnemonicExpanded) {
      return (<View>
        <View style={container.m15b}>
          <Text style={StyleSheet.flatten([font.weight400, text.textCenter, text.textGray])}>Your Wallet Seed:</Text>
          <Text style={StyleSheet.flatten([font.weight700, text.textCenter, text.textGray])}>Write it down and keep it somewhere safe.</Text>
        </View>

        <View style={StyleSheet.flatten([styles.wordsContainer, container.m10b, container.p15, container.p10t])}>
          <Text style={StyleSheet.flatten([font.size14, text.textLeft, text.textGray])}>{this.state.words}</Text>
        </View>

        <View style={container.m10b}>
          <Text style={StyleSheet.flatten([font.size12, text.textCenter, text.textGray])}>
                        Once you have written your wallet seed down, it is recommended to delete it from this device.
          </Text>
        </View>

        <View>
          <DagButton
            onClick={this.onDeleteWordsClick.bind(this)}
            style={StyleSheet.flatten([container.transparent, container.noBorder, container.p0])}
          >
            <Text style={StyleSheet.flatten([text.textRed, font.size11, text.textCenter, font.weight600])}>{'Delete words'.toUpperCase()}</Text>
          </DagButton>
        </View>
      </View>);
    }

    return null;
  }

  renderWalletSeed() {
    if (this.state.isWordsDeleted) {
      return (<Text style={StyleSheet.flatten([text.textGray, text.textCenter])}>
                Wallet seed not available.
              </Text>);
    }

    const buttonText = this.state.isMnemonicExpanded ? 'Hide the Wallet Seed' : 'Show the Wallet Seed Anyway';

    return (
      <View>
        <View style={container.m15b}>
          <DagButton onClick={this.onMnemonicToggle.bind(this)} style={StyleSheet.flatten([container.p10, container.noBorder, container.transparent, styles.button])}>
            <Text style={StyleSheet.flatten([styles.buttonText, font.size11])}>{buttonText.toUpperCase()}</Text>
          </DagButton>
        </View>

        {this.renderMnemonic()}
      </View>
    );
  }

  render() {
    return (
      <BasePageLayout style={container.p30}>
        <View style={container.m10b}>
          {this.renderText()}
        </View>

        {this.renderWalletSeed()}
      </BasePageLayout>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#ced5dc',
  },
  buttonText: {
    textAlign: 'center',
    color: '#7a8c9e',
  },
  wordsContainer: {
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#dddddd',
    backgroundColor: '#efefef',
    borderRadius: 10,
  },
});

export default BackupSeed;
