import React, { Component } from 'react';

import {
    StyleSheet, Switch
} from 'react-native';

class DagSwitch extends Component {
    constructor() {
        super();
    }

    render() {
        return (
            <Switch style={this.props.style} value={this.props.value} onValueChange={this.props.onValueChange} />
        );
    }
}

const styles = StyleSheet.create({

});

export default DagSwitch;
