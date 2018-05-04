import React, { Component } from 'react';

import {
    StyleSheet, View, Text
} from 'react-native';

class DagGroupList extends Component {
    constructor() {
        super();
    }

    render() {
        const groups = [];

        const getGroup = (key) => {
            let group = groups.find(g => g.key === key);

            if (!group) {
                group = {
                    key: key,
                    items: []
                };
                groups.push(group);
            }

            return group;
        };

        this.props.items.forEach((item, index) => {
            const group = getGroup(this.props.getGroupKey(item, index));
            group.items.push(item);
        });

        return (
            <View style={StyleSheet.flatten([this.props.containerStyle])}>
                {groups.map((group, groupIndex) => {
                     return (
                         <View key={groupIndex} style={this.props.groupContainerStyle}>
                             {this.props.renderGroup(group, groupIndex)}

                             {group.items.map((item, itemIndex) => {
                                 return this.props.renderItem(item, itemIndex, group.items.length);
                             })}
                         </View>
                     );
                })}
            </View>
        );
    }
}

DagGroupList.defaultProps = {
    items: [],
    getGroupKey: (item, index) => index,
    renderGroup: (group, index, total) => (<Text key={index}>{group.key}</Text>),
    renderItem: (item, index) => (<Text key={index}>{item}</Text>),
    groupContainerStyle: null,
};

export default DagGroupList;
