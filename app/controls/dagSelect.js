import React, { Component } from 'react';

import {
    StyleSheet, Picker, View, Text, Platform
} from 'react-native';
import {container, font, text} from "../styles/main";

class DagSelect extends Component {
    constructor() {
        super();

        this.state = {
            isDirty: false
        };

        this.renderLabel = this.renderLabel.bind(this);
        this.renderErrors = this.renderErrors.bind(this);
        this.isInvalid = this.isInvalid.bind(this);
    }

    onValueChange(value) {
        this.setState({isDirty: true});
        this.props.onValueChange(value);
    }

    isInvalid() {
        return this.props.invalid && (this.state.isDirty || this.props.isSubmitted);
    }

    getSelectStyles() {
        return null;
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
            <View style={StyleSheet.flatten([this.props.containerStyle])}>
                {this.renderLabel()}

                <View style={StyleSheet.flatten([
                    styles.selectContainer,
                    this.props.selectContainerStyle,
                    this.props.style,
                    this.isInvalid() ? styles.invalid: null])}>
                    <Picker selectedValue={this.props.value}
                            onValueChange={this.onValueChange.bind(this)}
                            itemStyle={StyleSheet.flatten([font.size14, this.props.itemStyle])}
                            style={StyleSheet.flatten([
                                styles.select,
                                this.getSelectStyles()
                            ])}
                            enabled={!this.props.disabled}>
                        {
                            this.props.items.map((item, i) => {
                                return (<Picker.Item key={i} label={item.label} value={item.value} />);
                            })
                        }
                    </Picker>
                </View>

                {this.renderErrors()}
            </View>
        );
    }
}

DagSelect.defaultProps = {
    disabled: false,
    onValueChange: (value) => {}
};

const styles = StyleSheet.create({
    selectContainer: {
        borderRadius: 5,
        borderColor: '#eee',
        borderStyle: 'solid',
        borderWidth: 2,
    },
    label: {
        color: '#aaaaaa'
    },
    select: {
        borderColor: 'transparent',
        paddingTop: 14,
        paddingBottom: 14,
        paddingLeft: 22,
        paddingRight: 22,
        color: '#666',
        backgroundColor: '#fff'
    },
    invalid: {
        borderColor: '#d51f26'
    }
});

export default DagSelect;
