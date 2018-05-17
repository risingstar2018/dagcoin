import React, { Component } from 'react';

import {
    StyleSheet, View
} from 'react-native';
import {container} from "../styles/main";
import DagTextInput from "./dagTextInput";
import DagSimpleButton from "./dagSimpleButton";
import DagSvg from "./dagSvg/dagSvg";

class DagPassword extends Component {
    constructor() {
        super();

        this.state = {
            isVisible: false
        };

        this.renderVisibilityIcon = this.renderVisibilityIcon.bind(this);
    }

    onVisibilityToggle() {
        this.setState({
            isVisible: !this.state.isVisible
        });
    }

    renderVisibilityIcon() {
        if (this.props.canChangeVisibility) {
            const icon = this.state.isVisible ? require('../../svg/hide_pass.svg') : require('../../svg/show_pass.svg');

            return (<DagSimpleButton style={[styles.visibilityButtonContainer, container.p15]}
                                     onClick={this.onVisibilityToggle.bind(this)}>
                <DagSvg width={18}
                        height={18}
                        source={icon}
                        fill={'#cccccc'}
                />
            </DagSimpleButton>);
        }
        return null;
    }

    render() {
        return (
            <View style={StyleSheet.flatten([styles.container, this.props.style])}>
                <DagTextInput {...this.props}
                              password={!(this.props.canChangeVisibility && this.state.isVisible)}
                              style={StyleSheet.flatten([container.p40r, this.props.inputStyle])}>
                    {this.renderVisibilityIcon()}
                </DagTextInput>

            </View>
        );
    }
}

DagPassword.defaultProps = {
    canChangeVisibility: true
};

const styles = StyleSheet.create({
    visibilityButtonContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        justifyContent: 'center'
    },
    visibilityIcon: {
        width: 18,
        height: 18
    }
});

export default DagPassword;
