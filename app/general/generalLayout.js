import React, {Component} from 'react';

import {
    StyleSheet, View
} from 'react-native';

import DagModalContainer from "../controls/dagModal/dagModalContainer";

class GeneralLayout extends Component {
    render() {
        return (
            <View style={StyleSheet.flatten([styles.container, this.props.style])}>
                <DagModalContainer />
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
