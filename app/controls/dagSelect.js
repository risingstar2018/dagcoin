import React, { Component } from 'react';

import {
    StyleSheet, Picker, View, Text, Platform
} from 'react-native';
import {font} from "../styles/main";
import DagFormControl, {LABEL_POSITION} from "./dagFormControl";

class DagSelect extends Component {
    constructor() {
        super();

        this.state = {
            isDirty: false
        };

        this.isInvalid = this.isInvalid.bind(this);
    }

    onValueChange(value) {
        this.setState({isDirty: true});
        this.props.onValueChange(value);
    }

    isInvalid() {
        return this.props.invalid && (this.state.isDirty || this.props.isSubmitted);
    }

    render() {
        return (
            <DagFormControl labelPosition={LABEL_POSITION.TOP}
                            {...this.props}
                            isDirty={this.state.isDirty}>
                <View style={StyleSheet.flatten([
                    styles.selectContainer,
                    this.props.selectContainerStyle,
                    this.props.style,
                    this.isInvalid() ? styles.invalid: null])}>
                    <Picker selectedValue={this.props.value}
                            ref={"picker"}
                            onValueChange={this.onValueChange.bind(this)}
                            itemStyle={StyleSheet.flatten([font.size14, this.props.itemStyle])}
                            style={StyleSheet.flatten([
                                styles.select
                            ])}
                            enabled={!this.props.disabled}>
                        {
                            this.props.items.map((item, i) => {
                                return (<Picker.Item key={i} label={item.label} value={item.value} />);
                            })
                        }
                    </Picker>
                </View>
            </DagFormControl>
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
