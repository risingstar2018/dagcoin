import React, { Component } from 'react';
import { RadioButtons } from 'react-native-radio-buttons'

import {
    StyleSheet, View, Text, TouchableWithoutFeedback
} from 'react-native';
import {container, font, text} from "../styles/main";

class DagRadioGroup extends Component {
    constructor() {
        super();

        this.renderRadioDot = this.renderRadioDot.bind(this);
        this.renderOption = this.renderOption.bind(this);
        this.renderContainer = this.renderContainer.bind(this);
        this.renderParagraphView = this.renderParagraphView.bind(this);
    }

    renderRadioDot(isSelected){
        if(isSelected) {
            return <View style={styles.radioDot}/>
        }
    }

    renderOption(option, selected, onSelect, index){
        const isSelected = option.value === this.props.selectedOption;

        return (
            <TouchableWithoutFeedback onPress={onSelect} key={index}>
                <View style={container.m20b}>
                    <View style={styles.container}>
                        <View style={styles.radio}>
                            {this.renderRadioDot(isSelected)}
                        </View>
                        <Text style={StyleSheet.flatten([styles.item, text.textGray, font.weight700])}>{option.label}</Text>
                    </View>
                    {this.renderParagraphView(option)}
                </View>
            </TouchableWithoutFeedback>
        );
    }

    renderContainer(optionNodes){
        return <View>{optionNodes}</View>;
    }

    renderParagraphView(obj) {
        if (obj.text) {
            return (
                <View style={styles.paragraph}>
                    <Text style={StyleSheet.flatten([text.textGray, font.size14, container.m0])}>{obj.text}</Text>
                </View>
            );
        }
        return null;
    }

    render() {
        return (
            <View>
                <RadioButtons
                    options={this.props.options}
                    onSelection={(option) => this.props.onSelect(option.value)}
                    renderOption={this.renderOption}
                    renderContainer={this.renderContainer}
                />
            </View>);
    }
}

const styles = StyleSheet.create({
    container:{
        flexGrow: 1,
        flexDirection: 'row'
    },
    radio: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#8597a7'
    },
    radioDot: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: '#d52026'
    },
    item: {
        marginLeft: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    paragraph: {

    }
});

export default DagRadioGroup;
