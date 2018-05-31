import React, { Component } from 'react';

import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import DagModalManager from './dagModalManager';
import DagSimpleButton from '../dagSimpleButton';
import { container } from '../../styles/main';

class DagModal extends Component {
  constructor() {
    super();

    DagModalManager.registerModal(this);
  }

  onCloseClick() {
    this.props.onClose();
    DagModalManager.hide();
  }

  renderCloseButton() {
    if (!this.props.canClose || this.props.hideCloseButton) {
      return null;
    }

    return (<DagSimpleButton onClick={this.onCloseClick.bind(this)} style={styles.closeButton}>
      <Image source={require('../../../img/close.png')} style={[styles.closeButtonIcon, container.m5]} />
            </DagSimpleButton>);
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={this.onCloseClick.bind(this)}
          disabled={!this.props.canClose}
          style={StyleSheet.flatten([styles.backdrop, this.props.backdropStyle])}
        />
        <View style={StyleSheet.flatten([styles.modal, this.props.style])}>
          {this.renderCloseButton()}
          {this.props.children}
        </View>
      </View>
    );
  }
}

DagModal.defaultProps = {
  hideCloseButton: false,
  canClose: true,
  onClose: () => {},
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 10,
  },
  closeButtonIcon: {
    width: 16,
    height: 16,
  },
  backdrop: {
    position: 'absolute',
    backgroundColor: '#000',
    opacity: 0.3,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  modal: {
    position: 'absolute',
    backgroundColor: '#fff',
    zIndex: 11,
    alignSelf: 'center',
    flex: 1,
    marginTop: 50,
    left: 20,
    right: 20,
    borderRadius: 5,
  },
});

export default DagModal;

