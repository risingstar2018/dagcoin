import React, {Component} from 'react';

import {
    StyleSheet, View, TouchableOpacity
} from 'react-native';
import DagModalManager from "./dagModalManager";
import DagSimpleButton from "../dagSimpleButton";
import {container} from "../../styles/main";
import DagSvg from "../dagSvg/dagSvg";

class DagModal extends Component {
    constructor() {
        super();

        DagModalManager.registerModal(this);
    }

    onCloseClick() {
        this.props.onClose();
        DagModalManager.hide();
    }

    renderCloseButton() {
        if (!this.props.canClose || this.props.hideCloseButton) {
            return null;
        }

        return (<DagSimpleButton onClick={this.onCloseClick.bind(this)} style={styles.closeButton}>
            <DagSvg width={24}
                    height={24}
                    source={require('../../../svg/close.svg')}
                    fill={'#a5b2bf'}
            />
        </DagSimpleButton>);
    }

    render() {
        return (
            <View style={styles.container}>
                <TouchableOpacity onPress={this.onCloseClick.bind(this)}
                                  disabled={!this.props.canClose}
                                  style={StyleSheet.flatten([styles.backdrop, this.props.backdropStyle])}>
                </TouchableOpacity>
                <View style={StyleSheet.flatten([styles.modal, this.props.style])}>
                    {this.renderCloseButton()}
                    {this.props.children}
                </View>
            </View>
        );
    }
}

DagModal.defaultProps = {
    hideCloseButton: false,
    canClose: true,
    onClose: () => {}
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    closeButton: {
        position: 'absolute',
        right: 15,
        top: 15,
        zIndex: 10
    },
    backdrop: {
        position: 'absolute',
        backgroundColor: '#000',
        opacity: 0.3,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10
    },
    modal: {
        position: 'absolute',
        backgroundColor: '#fff',
        zIndex: 11,
        alignSelf: 'center',
        flex: 1,
        marginTop: 50,
        left: 20,
        right: 20,
        borderRadius: 5
    }
});

export default DagModal;


