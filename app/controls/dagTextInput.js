import React, { Component } from 'react';

import {
    StyleSheet, View, Text, TextInput
} from 'react-native';
import {container, font, text} from "../styles/main";

class DagTextInput extends Component {
    constructor() {
        super();

        this.state = {
            isDirty: false,
            focused: false
        };

        this.renderLabel = this.renderLabel.bind(this);
        this.renderErrors = this.renderErrors.bind(this);
        this.isInvalid = this.isInvalid.bind(this);
    }

    onValueChange(value) {
        this.setState({isDirty: true});

        if (this.props.onValueChange){
            this.props.onValueChange(value);
        }
    }

    isInvalid() {
        return this.props.invalid && (this.state.isDirty || this.props.isSubmitted);
    }

    renderLabel() {
        if (this.props.renderLabel) {
            return this.props.renderLabel();
        }

        if (this.props.label) {
            return (<Text style={StyleSheet.flatten([styles.label, font.size10, font.weight700, container.m5b, this.props.labelStyle])}>
                {this.props.label}
            </Text>);
        }

        return null;
    }

    renderErrors() {
        if (this.props.renderErrors) {
            return this.props.renderErrors(this.props.errors);
        }

        if (this.isInvalid() && this.props.errors && this.props.errors.length) {
            return (<View>
                {
                    this.props.errors.map((err, i) => {
                        return (
                            <Text key={'error-'+i} style={StyleSheet.flatten([text.textRed, font.size10, font.weight700, container.m5t, this.props.errorStyle])}>
                                {err}
                            </Text>
                        );
                    })
                }
            </View>);
        }

        return null;
    }

    render() {
        return (
            <View style={this.props.containerStyle}>
                {this.renderLabel()}

                <View style={StyleSheet.flatten([styles.inputContainer, this.props.inputContainerStyle])}>
                    <TextInput
                        onFocus={() => this.setState({focused: true})}
                        onBlur={() => this.setState({focused: false})}
                        multiline={this.props.multiline}
                        style={StyleSheet.flatten([
                            styles.input,
                            font.size14,
                            this.props.style,
                            this.isInvalid() ? styles.invalid: null,
                            this.state.focused ? styles.focused: null
                        ])}
                        onChangeText={this.onValueChange.bind(this)}
                        value={this.props.value}
                        secureTextEntry={this.props.password}
                        placeholder={this.props.placeholder}
                        placeholderTextColor={this.props.placeholderTextColor || '#8597a7'}
                    />
                    {this.props.children}
                </View>

                {this.renderErrors()}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    inputContainer: {
        position: 'relative'
    },
    label: {
        color: '#aaaaaa'
    },
    input: {
        borderRadius: 5,
        borderColor: '#eee',
        borderStyle: 'solid',
        borderWidth: 2,
        paddingTop: 14,
        paddingBottom: 14,
        paddingLeft: 22,
        paddingRight: 22,
        color: '#666',
        backgroundColor: '#fff',
        outline: 'none'
    },
    focused: {
        borderColor: '#999',
    },
    invalid: {
        borderColor: '#d51f26'
    }
});

export default DagTextInput;
