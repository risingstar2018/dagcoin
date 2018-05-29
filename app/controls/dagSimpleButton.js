import React from 'react';
import PropTypes from 'prop-types';

import { StyleSheet, TouchableOpacity } from 'react-native';

const DagSimpleButton = props => (
  <TouchableOpacity
    onPress={props.onClick}
    style={StyleSheet.flatten([props.style])}
    disabled={props.disabled}
  >
    {props.children}
  </TouchableOpacity>
);

DagSimpleButton.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
  disabled: PropTypes.func,
  style: PropTypes.shape([PropTypes.string, PropTypes.number]),
};

DagSimpleButton.defaultProps = {
  children: {},
  onClick: undefined,
  disabled: undefined,
  style: {},
};

export default DagSimpleButton;
