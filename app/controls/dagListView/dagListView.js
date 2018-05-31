import React, { Component } from 'react';

import { StyleSheet, View, ListView, Text } from 'react-native';
import DagListViewRow from './dagListViewRow';
import { container, font } from '../../styles/main';

class DagListView extends Component {
  constructor() {
    super();

    this.renderTitle = this.renderTitle.bind(this);
  }

  getDataSource(options) {
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    return ds.cloneWithRows(options);
  }

  renderTitle() {
    if (this.props.title) {
      return (
        <Text style={StyleSheet.flatten([styles.title, container.m10b, container.p10l, font.weight400, font.size12])}>{this.props.title.toUpperCase()}</Text>
      );
    }

    return null;
  }

  render() {
    const ds = this.getDataSource(this.props.options);

    return (
      <View style={this.props.style}>
        {this.renderTitle()}
        <ListView
          style={StyleSheet.flatten([styles.container])}
          dataSource={ds}
          renderRow={data => <DagListViewRow {...data} />}
          renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    shadowColor: 'rgba(151, 151, 151, 0.098)',
  },
  separator: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#eee',
  },
  title: {
    color: '#969696',
  },
});

export default DagListView;
