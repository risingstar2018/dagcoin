import React, { Component } from 'react';

import {
    StyleSheet, View, Image
} from 'react-native';
import {container} from "../styles/main";
import DagTextInput from "./dagTextInput";
import DagIconButton from "./dagIconButton";
import DagSetPasswordModal from "./dagModal/modals/dagSetPasswordModal";

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
            if (this.state.isVisible) {
                return (
                    <DagIconButton style={styles.visibilityButtonContainer}
                                   onClick={this.onVisibilityToggle.bind(this)}>
                        <Image style={styles.visibilityIcon} source={require('../../img/hide_pass.png')} />
                    </DagIconButton>
                );
            }
            else {
                return (
                    <DagIconButton style={styles.visibilityButtonContainer}
                                   onClick={this.onVisibilityToggle.bind(this)}>
                        <Image style={styles.visibilityIcon} source={require('../../img/show_pass.png')} />
                    </DagIconButton>
                );
            }
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
        right: 15,
        top: 0,
        bottom: 0,
        justifyContent: 'center'
    },
    visibilityIcon: {
        width: 18,
        height: 18
    }
});

export default DagPassword;
