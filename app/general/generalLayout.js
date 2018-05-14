import React, {Component} from 'react';

import {
    StyleSheet, View
} from 'react-native';

class GeneralLayout extends Component {
    constructor() {
        super();
    }

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
    },
    drawerStyle: {
        backgroundColor: '#fff'
    }
});

export default GeneralLayout;
