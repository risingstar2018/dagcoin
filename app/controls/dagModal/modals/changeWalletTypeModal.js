import React, { Component } from 'react';

import { StyleSheet, View, Text } from 'react-native';
import DagButton from '../../dagButton';

import { container, font, text } from '../../../styles/main';
import DagModal from '../dagModal';

class ChangeWalletTypeModal extends Component {
  constructor() {
    super();
  }

  onChangeClick() {
    this.props.onChange();
  }

  onCancelClick() {
    this.props.onCancel();
  }

  render() {
    return (
      <DagModal
        onClose={this.onCancelClick.bind(this)}
        style={StyleSheet.flatten([container.p30, container.m20t])}
      >
        <View style={styles.container}>
          <Text style={StyleSheet.flatten([styles.header, font.size16, text.textCenter, font.weight700, container.m20b])}>{'Change wallet type!'.toUpperCase()}</Text>

          <Text style={StyleSheet.flatten([font.size14])}>
                        The wallet will contain the most current state of the entire Dagcoin database.
                        This option is better for privacy but will take several gigabytes of storage and the initial sync will take several days.
                        CPU load will be high during sync. After changing to full wallet your money won't be visible until database will synchronize your transactions.
          </Text>

          <View style={StyleSheet.flatten([container.m15l, container.m15r, container.m20t])}>
            <DagButton
              text={'Change it'.toUpperCase()}
              textStyle={StyleSheet.flatten([font.size16])}
              onClick={this.onChangeClick.bind(this)}
            />
            <DagButton
              style={StyleSheet.flatten([container.noBorder, styles.cancelButton])}
              textStyle={StyleSheet.flatten([text.textRed, font.size16])}
              text={'Cancel'.toUpperCase()}
              onClick={this.onCancelClick.bind(this)}
            />
          </View>
        </View>
      </DagModal>
    );
  }
}

ChangeWalletTypeModal.defaultProps = {
  onChange: () => {},
  onCancel: () => {},
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    color: 'rgb(52, 73, 94)',
  },
  buttonsContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  button: {
    borderRadius: 100,
    padding: 15,
    shadowOpacity: 0,
    flex: 1,
    shadowColor: 0,
  },
  cancelButton: {
    borderColor: 'transparent',
    borderWidth: 1,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
  },
});

export default ChangeWalletTypeModal;

