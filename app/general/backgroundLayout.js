import React, {Component} from 'react';

import {
    StyleSheet, View, Image
} from 'react-native';

import { container } from '../styles/main';
import DagSvg from '../controls/dagSvg/dagSvg';

class BackgroundLayout extends Component {
    render() {
        return (
            <View style={StyleSheet.flatten([container.p40, this.props.style, container.flex])}>
                <View style={StyleSheet.flatten([styles.contentContainer])}>
                    {this.props.children}
                </View>
                <View style={styles.bgContainer}>
                    <DagSvg width={250}
                            height={300}
                            source={require('../../svg/bgshape1.svg')}
                            fill={'#f2f2f2'}
                            style={styles.bgshape1}
                    />

                    <DagSvg width={200}
                            height={200}
                            fill={'#f2f2f2'}
                            source={require('../../svg/bgshape2.svg')}
                            style={styles.bgshape2}
                    />
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    bgContainer: {
        position: 'absolute',
        zIndex: 0,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    },
    contentContainer: {
        zIndex: 1,
        flex: 1
    },
    bgshape2: {
        position: 'absolute',
        top: 0,
        right: 0
    },
    bgshape1: {
        position: 'absolute',
        bottom: 0,
        left: -150
    }
});

export default BackgroundLayout;
