import React, {Component} from 'react';

import {
    StyleSheet, View
} from 'react-native';

import DagModalContainer from "../controls/dagModal/dagModalContainer";
import DagLeftMenu from "../controls/dagMenu/dagLeftMenu/dagLeftMenu";

class GeneralLayout extends Component {
    render() {
        return (
            <View style={StyleSheet.flatten([styles.container, this.props.style])}>
                <DagModalContainer />
                <DagLeftMenu>
                    {this.props.children}
                </DagLeftMenu>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    }
});

export default GeneralLayout;
