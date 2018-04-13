import React, {Component} from 'react';

import {
    StyleSheet, View, Image
} from 'react-native';

import { container } from "../styles/main";

class GeneralLayout extends Component {
    render() {
        return (
            <View style={StyleSheet.flatten([styles.container, this.props.style])}>
                {this.props.children}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    }
});

export default GeneralLayout;
