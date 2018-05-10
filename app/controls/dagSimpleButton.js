import React, { Component } from 'react';

import {
    StyleSheet, TouchableOpacity
} from 'react-native';

class DagSimpleButton extends Component {
    constructor() {
        super();
    }

    render() {
        return (
            <TouchableOpacity onPress={this.props.onClick}
                              style={StyleSheet.flatten([this.props.style])}
                              disabled={this.props.disabled}>
                {this.props.children}
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({

});

export default DagSimpleButton;
