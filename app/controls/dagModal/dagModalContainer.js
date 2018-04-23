import React, { Component } from 'react';
import DagModalManager from "./dagModalManager"

import {
    Dimensions,
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
       width: Dimensions.get('window').width,
       height: Dimensions.get('window').height
   }
});

export default DagModalContainer;


