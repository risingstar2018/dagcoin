import React, { Component } from 'react';

import { StyleSheet } from 'react-native';

import PlainWallet from './plainWallet';
import DagTabView from '../controls/dagTabView';
import GeneralLayout from '../general/generalLayout';
import PageHeader from '../general/pageHeader';
import MultiDeviceWallet from './multiDeviceWallet';

class NewWallet extends Component {
  constructor() {
    super();
  }

  render() {
    const tabs = [{
      title: 'Plain Wallet',
      view: (<PlainWallet />),
    }, {
      title: 'Multidevice Wallet',
      view: (<MultiDeviceWallet />),
    }];

    return (
      <GeneralLayout style={StyleSheet.flatten([styles.container, this.props.style])}>
        <PageHeader color="red" hasMenu title={'Create new wallet'.toUpperCase()} />
        <DagTabView tabs={tabs} />
      </GeneralLayout>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default NewWallet;
