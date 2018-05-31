import React from 'react';
import PropTypes from 'prop-types';

import { StyleSheet, TouchableOpacity } from 'react-native';

const DagSimpleButton = props => (
  <TouchableOpacity
    onPress={props.onClick}
    onLongPress={props.onLongPress}
    style={StyleSheet.flatten([props.style])}
    disabled={props.disabled}
    activeOpacity={props.activeOpacity}
  >
    {props.children}
  </TouchableOpacity>
);

DagSimpleButton.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
  onLongPress: PropTypes.func,
  disabled: PropTypes.func,
  style: PropTypes.shape([PropTypes.string, PropTypes.number, PropTypes.array, PropTypes.object]),
  activeOpacity: PropTypes.number,
};

DagSimpleButton.defaultProps = {
  children: undefined,
  onClick: undefined,
  onLongPress: undefined,
  disabled: undefined,
  style: undefined,
  activeOpacity: 1,
};

export default DagSimpleButton;
