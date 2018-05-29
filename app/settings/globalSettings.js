import React, { Component } from 'react';

import { StyleSheet, View, Text } from 'react-native';

import Navigator from '../navigator/navigationManager';
import { routes } from '../navigator/routes';

import DagButton from '../controls/dagButton';
import { container, control, text, font } from '../styles/main';
import DagListView from '../controls/dagListView/dagListView';
import SettingsPageLayout from './settingsPageLayout';

class GlobalSettings extends Component {
  constructor() {
    super();

    this.state = {
      needBackup: true,
    };

    this.onBackupClick = this.onBackupClick.bind(this);
    this.renderBackupNotification = this.renderBackupNotification.bind(this);
  }

  onBackupClick() {
    console.log('backup');
    this.setState({
      needBackup: false,
    });
  }

  renderBackupNotification() {
    if (this.state.needBackup) {
      return (
        <View style={styles.backupContainer}>
          <Text style={StyleSheet.flatten([container.m10b, font.weight600, text.size14, styles.backupTitle])}>WALLET BACKUP</Text>
          <Text style={StyleSheet.flatten([container.m10b, font.weight400, text.size12, styles.backupDescription])}>
                        For security reasons we strongly recommend you to back your wallet seed up as soon as possible.
          </Text>
          <DagButton
            style={StyleSheet.flatten([container.m20b, styles.backupButton])}
            text="Back Up"
            onClick={() => this.onBackupClick()}
          />
        </View>
      );
    }
    return null;
  }

  render() {
    const generalOptions = [
      {
        title: 'System',
        description: 'Setup your wallets.',
        onClick: () => {
          Navigator.to(this, routes.SystemSettings);
        },
        icon: require('../../img/website.png'),
      },
      {
        title: 'Security',
        description: 'Backup your wallets and configure restrictions.',
        onClick: () => {
          Navigator.to(this, routes.SecuritySettings);
        },
        icon: require('../../img/shield.png'),
      },
    ];

    const otherOptions = [
      {
        title: 'About Device',
        description: 'Information about device in use.',
        onClick: () => {
          Navigator.to(this, routes.AboutDeviceSettings);
        },
        icon: require('../../img/responsive.png'),
      },
      {
        title: 'About Dagcoin',
        description: 'Information about changes and app in general.',
        onClick: () => {
          Navigator.to(this, routes.AboutDagcoinSettings);
        },
        icon: require('../../img/certificate.png'),
      },
    ];

    return (
      <SettingsPageLayout hasMenu title="Global Preferences">
        {this.renderBackupNotification()}
        <DagListView style={container.m10b} title="General" options={generalOptions} />
        <DagListView style={container.m10b} title="Other" options={otherOptions} />
      </SettingsPageLayout>
    );
  }
}

const styles = StyleSheet.create({
  backupContainer: {
    marginLeft: 10,
  },
  backupTitle: {
    color: '#444',
  },
  backupDescription: {
    color: '#979b9f',
  },
  backupButton: {
    width: 100,
    padding: 3,
  },
});

export default GlobalSettings;
