import React, { Component } from 'react';

import { StyleSheet } from 'react-native';

import { container, control } from '../styles/main';
import GeneralLayout from '../general/generalLayout';
import PageHeader from '../general/pageHeader';
import BasePageLayout from '../general/basePageLayout';

class SettingsPageLayout extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <GeneralLayout style={StyleSheet.flatten([styles.container, this.props.style])}>
        <PageHeader hasMenu={this.props.hasMenu} canBack={this.props.canBack} title={(this.props.title || '').toUpperCase()} />
        <BasePageLayout style={StyleSheet.flatten([container.p20, styles.container, this.props.pageLayout])}>
          {this.props.children}
        </BasePageLayout>
      </GeneralLayout>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
  },
});

export default SettingsPageLayout;
