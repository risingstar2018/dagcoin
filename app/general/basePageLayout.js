import React, { Component } from 'react';

import { StyleSheet, ScrollView } from 'react-native';

import { container } from '../styles/main';

class BasePageLayout extends Component {
  render() {
    return (
      <ScrollView style={StyleSheet.flatten([container.p40, styles.container, this.props.style])}>
        {this.props.children}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default BasePageLayout;
