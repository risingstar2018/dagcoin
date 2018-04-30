import React, { Component } from 'react';
import DagModalManager from "./dagModalManager"

import {
    StyleSheet, View
} from 'react-native';

class DagModalContainer extends Component {
    constructor() {
        super();

        DagModalManager.registerModal(this);
    }

    update() {
        this.forceUpdate();
    }

    render() {
        if (!DagModalManager.content) {
            return null;
        }

        return (<View style={styles.container}>
            {DagModalManager.content}
        </View>);
    }
}

const styles = StyleSheet.create({
   container: {
       position: 'absolute',
       zIndex: 100,
       top: 0,
       bottom: 0,
       left: 0,
       right: 0
   }
});

export default DagModalContainer;


