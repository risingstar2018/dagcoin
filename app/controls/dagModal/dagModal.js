import React, {Component} from 'react';

import {
    StyleSheet, View, TouchableOpacity, Dimensions
} from 'react-native';
import DagModalManager from "./dagModalManager";

class DagModal extends Component {
    onBackdropClick() {
        this.props.onClose();
        DagModalManager.hide();
    }

    render() {
        return (
            <View style={styles.container}>
                <TouchableOpacity onPress={this.onBackdropClick.bind(this)}
                                  disabled={!this.props.backdrop}
                                  style={StyleSheet.flatten([styles.backdrop, this.props.backdropStyle])}>
                </TouchableOpacity>
                <View style={StyleSheet.flatten([styles.modal, this.props.style])}>
                    {this.props.children}
                </View>
            </View>
        );
    }
}

DagModal.defaultProps = {
    backdrop: true,
    onClose: () => {}
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    backdrop: {
        position: 'absolute',
        backgroundColor: '#000',
        opacity: 0.3,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        zIndex: 10
    },
    modal: {
        position: 'absolute',
        backgroundColor: '#fff',
        zIndex: 11,
        alignSelf: 'center',
        flex: 1,
        width: Dimensions.get('window').width * 0.8,
        marginTop: 40,
        padding: 40,
        borderRadius: 5
    }
});

export default DagModal;


