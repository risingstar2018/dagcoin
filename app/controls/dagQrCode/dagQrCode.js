import React, { Component } from 'react';

import {
    StyleSheet, Platform, View
} from 'react-native';

class DagQrCode extends Component {
    constructor() {
        super();
    }

    render() {
        this.component = (Platform.OS === 'web' ? require('./web/index') : require('./mobile/index')).default;

        return (<View style={this.props.style}>
            <this.component {...this.props} />
        </View>);
    }
}

DagQrCode.defaultProps = {
    value: '',
    color: '#d51f26',
    backgroundColor: '#ffffff',
    logo: require('../../../img/dagcoin_35x35.png'),
    size: 180
};

const styles = StyleSheet.create({

});

export default DagQrCode;
