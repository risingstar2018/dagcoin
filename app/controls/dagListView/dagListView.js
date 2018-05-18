import React, { PureComponent } from 'react';

import {
    StyleSheet, View, FlatList, Text
} from 'react-native';
import DagListViewRow from "./dagListViewRow";
import {container, font} from "../../styles/main";

class DagListView extends PureComponent {
    constructor() {
        super();

        this.renderTitle = this.renderTitle.bind(this);
    }

    renderTitle() {
        if (this.props.title) {
            return (
                <Text style={StyleSheet.flatten([styles.title, container.m10b, container.p10l, font.weight400, font.size12])}>{this.props.title.toUpperCase()}</Text>
            );
        }

        return null;
    }

    renderSeparator(index, total) {
        if (index === total - 1) {
            return null;
        }

        return (<View style={styles.separator} />);
    }

    render() {
        return (
            <View style={this.props.style}>
                {this.renderTitle()}
                <View style={StyleSheet.flatten([styles.container])}>
                    {this.props.options.map((o, i) => {
                        return (<View key={i}>
                            <DagListViewRow {...o} />
                            {this.renderSeparator(i, this.props.options.length)}
                        </View>);
                    })}
                </View>
            </View>);
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 5,
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        shadowColor: 'rgba(151, 151, 151, 0.098)'
    },
    separator: {
        flex: 1,
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#eee',
    },
    title: {
        color: '#969696'
    }
});

export default DagListView;
