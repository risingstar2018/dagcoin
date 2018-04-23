import React, {Component} from 'react';

import {
    StyleSheet, View, Image
} from 'react-native';

import { container } from "../styles/main";
import GeneralLayout from "./generalLayout";

class BasePageLayout extends Component {
    render() {
        return (
            <View style={StyleSheet.flatten([container.p40, styles.container, this.props.style])}>
                {this.props.children}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});

export default BasePageLayout;
