import React, { Component } from 'react';

import {
    Modal, Text, StyleSheet
} from 'react-native';

class DagModal extends Component {
    constructor() {
        super();
    }

    render() {
        return (
            <Modal visible={this.props.visible}>
                {this.props.children}
            </Modal>
        );
    }
}

const styles = StyleSheet.create({

});

export default DagModal;


