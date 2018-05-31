import React, { Component } from 'react';

import { StyleSheet, View, Text } from 'react-native';

import { container, font, text } from '../../../styles/main';

class ContactListGroup extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <View style={StyleSheet.flatten([styles.container, container.m10t, container.m10b])}>
        <Text style={StyleSheet.flatten([text.textGray])}>{this.props.title}</Text>
      </View>
    );
  }
}

ContactListGroup.defaultProps = {
  title: '',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ContactListGroup;
