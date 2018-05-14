import React, { Component } from 'react';
import { Switch } from 'react-native-switch';

import {
    StyleSheet, Text, View
} from 'react-native';
import DagFormControl, {LABEL_POSITION} from "./dagFormControl";

class DagSwitch extends Component {
    constructor() {
        super();
    }

    getSwitchContainerStyle() {
        return this.props.switchContainerStyle || {
            borderStyle: 'solid',
            borderWidth: 1,
            borderColor: !this.props.value ? '#dfdfdf' : this.props.backgroundActive,
            width: 54
        };
    }

    getInnerCircleStyle() {
        return this.props.innerCircleStyle || {
            shadowColor: '#000000',
            shadowOpacity: 0.4,
            shadowOffset: {  width: 0,  height: 1 },
            shadowRadius: 3,
            elevation: 3
        }
    }

    render() {
        return (
            <DagFormControl {...this.props}
                            labelPosition={LABEL_POSITION.LEFT}
                            onLabelClick={() => { this.props.onValueChange(!this.props.value); }}>
                    <Switch value={this.props.value}
                            disabled={this.props.disabled}
                            renderActiveText={false}
                            renderInActiveText={false}
                            backgroundActive={this.props.backgroundActive}
                            backgroundInactive={this.props.backgroundInactive}
                            circleActiveColor={this.props.circleActiveColor}
                            circleInActiveColor={this.props.circleInActiveColor}
                            circleBorderWidth={this.props.circleBorderWidth}
                            onValueChange={this.props.onValueChange}
                            circleBorderActiveColor={this.props.circleBorderActiveColor}
                            circleBorderInactiveColor={this.props.circleBorderInactiveColor}
                            containerStyle={this.getSwitchContainerStyle()}
                            innerCircleStyle={this.getInnerCircleStyle()}
                            switchWidthMultiplier={this.props.switchWidthMultiplier}
                            barHeight={this.props.barHeight}
                            switchLeftPx={this.props.switchLeftPx}
                            switchRightPx={this.props.switchRightPx} />
            </DagFormControl>
        );
    }
}

DagSwitch.defaultProps = {
    disabled: false,
    backgroundActive: '#64bd63',
    backgroundInactive: '#ffffff',
    circleActiveColor: '#ffffff',
    circleInActiveColor: '#ffffff',
    circleBorderWidth: 0,
    circleBorderActiveColor: 'transparent',
    circleBorderInactiveColor: 'transparent',
    barHeight: 32,
    switchLeftPx: 3,
    switchRightPx: 2.30,
    switchWidthMultiplier: 1.82,
    switchContainerStyle: null,
    innerCircleStyle: null,
    containerStyle: null,
    onValueChange: (value) => {}
};

const styles = StyleSheet.create({

});

export default DagSwitch;
