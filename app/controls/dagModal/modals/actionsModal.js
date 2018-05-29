import React, { Component } from 'react';

import { StyleSheet, View, Text } from 'react-native';
import DagButton from '../../dagButton';

import { container } from '../../../styles/main';
import DagModal from '../dagModal';

class ActionsModal extends Component {
  render() {
    return (
      <DagModal style={styles.modal}>
        <View style={StyleSheet.flatten([styles.container, container.p15])}>
          {this.props.actions.map((a, i) => (
            <DagButton
              key={i}
              onClick={a.action}
              style={StyleSheet.flatten([container.m0, container.p0, container.noBorder, container.transparent])}
            >
              <Text style={container.p10}>{a.label}</Text>
            </DagButton>
                        ))}
        </View>
      </DagModal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modal: {
    left: 0,
    right: 0,
    marginTop: 0,
    bottom: 0,
    borderRadius: 0,
  },
});

export default ActionsModal;
