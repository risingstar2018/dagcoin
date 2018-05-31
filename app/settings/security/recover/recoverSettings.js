import React, { Component } from 'react';

import { StyleSheet } from 'react-native';

import DagTabView from '../../../controls/dagTabView';
import GeneralLayout from '../../../general/generalLayout';
import PageHeader from '../../../general/pageHeader';
import RecoverSeed from './recoverSeed';
import RecoverBackup from './recoverBackup';

class RecoverSettings extends Component {
  constructor() {
    super();
  }

  render() {
    const tabs = [{
      title: 'Recover from seed',
      view: (<RecoverSeed />),
    }, {
      title: 'Recover from backup',
      view: (<RecoverBackup />),
    }];

    return (
      <GeneralLayout style={StyleSheet.flatten([styles.container, this.props.style])}>
        <PageHeader canBack title={'Recovery'.toUpperCase()} />
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

export default RecoverSettings;
