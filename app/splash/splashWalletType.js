import React, { Component } from 'react';

import { StyleSheet, View, Text } from 'react-native';

import Navigator from '../navigator/navigationManager';
import { routes } from '../navigator/routes';
import DagButton from '../controls/dagButton';
import DagRadioGroup from '../controls/dagRadioGroup';
import { container, text, font } from '../styles/main';
import BackgroundLayout from '../general/backgroundLayout';
import BasePageLayout from '../general/basePageLayout';
import { FULL_WALLET, LIGHT_WALLET } from '../constants/walletType';

class SplashWalletType extends Component {
  constructor() {
    super();

    this.state = {
      selectedType: LIGHT_WALLET,
    };
  }

  onSetWalletTypeClick() {
    Navigator.to(this, routes.SplashDeviceName, {
      walletType: this.state.selectedType,
      sideMenu: false,
    });
  }

  onWalletTypeChange(value) {
    this.setState({
      selectedType: value,
    });
  }

  render() {
    const options = [
      {
        label: 'DOWNLOAD THE ENTIRE DAGCOIN DATABASE',
        value: FULL_WALLET,
        text: 'The wallet will contain the most current ' +
                'state of the entire Dagcoin database. This option is better ' +
                'for privacy but will take several gigabytes of storage and the initial sync will take several days. ' +
                'CPU load will be high during sync.',
      },
      {
        label: 'KEEP ONLY DATA RELEVANT TO YOU',
        value: LIGHT_WALLET,
        text: 'The wallet will contain minimum information relevant to you. The wallet vendor will be able to know ' +
                'some of your balances and will be able to see which transactions are yours, but you can start using the ' +
                'wallet immediately and the wallet is fully functional.',
      },
    ];

    return (
      <BackgroundLayout style={container.p0}>
        <BasePageLayout>
          <View style={StyleSheet.flatten([styles.container])}>
            <Text style={StyleSheet.flatten([text.textBrand, font.weight700, font.size14, container.m20b])}>{'Please choose the type of this wallet'.toUpperCase()}</Text>

            <DagRadioGroup
              options={options}
              onSelect={this.onWalletTypeChange.bind(this)}
              selectedOption={this.state.selectedType}
            />

            <DagButton text="CONTINUE" onClick={this.onSetWalletTypeClick.bind(this)} />
          </View>
        </BasePageLayout>
      </BackgroundLayout>
    );
  }
}

const styles = StyleSheet.create({
  container: {

  },
});

export default SplashWalletType;
