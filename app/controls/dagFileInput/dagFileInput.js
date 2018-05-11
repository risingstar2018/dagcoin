import React, { Component } from 'react';

import {
    StyleSheet, TouchableOpacity, View, Text, Platform
} from 'react-native';
import {container, text} from "../../styles/main";

class DagFile extends Component {
    constructor() {
        super();

        this.state = {
            defaultName: 'Choose file',
            name: ''
        }
    }

    onClick() {
        const manager = Platform.OS === 'web' ? require('./web/index') : require('./mobile/index');
        manager.select().then((file) => {
            this.props.onValueChange(file);
            this.setState({name: file.name});
        }, () => {
            this.props.onValueChange(null);
            this.setState({name: ''});
        });
    }

    render() {
        return (
            <TouchableOpacity
                onPress={this.onClick.bind(this)}
                style={StyleSheet.flatten([styles.container, container.p15, this.props.style])}
                disabled={this.props.disabled}
            >
                <View>
                    <Text style={text.textGray}>{this.state.name || this.state.defaultName}</Text>
                </View>
            </TouchableOpacity>
        );
    }
}

DagFile.defaultProps = {
    onValueChange: (file) => {}
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 5,
        shadowRadius: 2,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#ccc'
    },
    text: {
        textAlign: 'center',
        color: '#ccc',
        fontWeight: '600'
    }
});

export default DagFile;
