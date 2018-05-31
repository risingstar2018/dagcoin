import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

import { container } from '../../styles/main';
import DagSimpleButton from '../dagSimpleButton';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    color: '#494d50',
  },
  description: {
    fontSize: 12,
    color: '#999',
  },
  photo: {
    height: 24,
    width: 24,
  },
  chevron: {
    width: 10,
    height: 10,
  },
  contentContainer: {
    flex: 1,
  },
});

const RenderChildren = (props) => {
  if (props.children) {
    return (
      <View>
        {props.children}
      </View>
    );
  }

  return null;
};

const RenderIcon = (props) => {
  if (props.icon) {
    return (
      <Image source={props.icon} style={StyleSheet.flatten([styles.photo, container.m10])} />
    );
  }

  return null;
};

const RenderChevron = (props) => {
  if (props.onClick) {
    return (
      <Image source={require('../../../img/chevron-thin-right.png')} style={styles.chevron} />
    );
  }

  return null;
};

const RenderDescription = (props) => {
  if (props.description) {
    return (
      <Text style={StyleSheet.flatten([styles.description, container.m5t])}>
        {props.description}
      </Text>
    );
  }

  return null;
};

const DagListViewRow = props => (<DagSimpleButton style={styles.container} disabled={!props.onClick} onClick={() => props.onClick && props.onClick()}>
  {RenderIcon(props)}
  <View style={StyleSheet.flatten([styles.contentContainer, container.m15l])}>
    <Text style={StyleSheet.flatten([styles.title])}>
      {props.title}
    </Text>
    {RenderDescription(props)}
  </View>
  {RenderChildren(props)}
  {RenderChevron(props)}
                                 </DagSimpleButton>);

export default DagListViewRow;
