import React, { Component } from 'react';

import {
    StyleSheet, TouchableOpacity, View, Text, Platform
} from 'react-native';
import {container, text} from "../../styles/main";
import DagSimpleButton from "../dagSimpleButton";
import DagFormControl from "../dagFormControl";
import FileWrapper from "../../classes/fileWrapper";

class DagFile extends Component {
    constructor() {
        super();

        this.state = {
            defaultName: 'Choose file',
            name: '',
            isDirty: false
        }
    }

    isInvalid() {
        return this.props.invalid && (this.state.isDirty || this.props.isSubmitted);
    }

    onClick() {
        const manager = Platform.OS === 'web' ? require('./web/index') : require('./mobile/index');
        manager.select().then((file) => {
            this.props.onValueChange(new FileWrapper(file, manager));
            this.setState({name: file.name});
        }, () => {
            this.props.onValueChange(null);
            this.setState({name: ''});
        });

        setTimeout(() => {
            this.setState({
                isDirty: true
            });
        }, 500);
    }

    render() {
        return (
            <DagFormControl {...this.props} isDirty={this.state.isDirty} onLabelClick={this.onClick.bind(this)}>
                <DagSimpleButton
                    onClick={this.onClick.bind(this)}
                    style={StyleSheet.flatten([
                        container.p15,
                        styles.container,
                        this.isInvalid() ? styles.invalid: null,
                        this.props.style
                    ])}
                    disabled={this.props.disabled}
                >
                    <View>
                        <Text style={text.textGray}>{this.state.name || this.state.defaultName}</Text>
                    </View>
                </DagSimpleButton>
            </DagFormControl>
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
        borderColor: '#ccc',
        paddingLeft: 22,
        paddingRight: 22
    },
    text: {
        textAlign: 'center',
        color: '#ccc',
        fontWeight: '600'
    },
    invalid: {
        borderColor: '#d51f26'
    }
});

export default DagFile;
