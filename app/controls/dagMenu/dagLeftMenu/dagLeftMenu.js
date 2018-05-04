import React, {Component} from 'react';

import {
    StyleSheet, View
} from 'react-native';
import DagLeftMenuManager from "./dagLeftMenuManager";
import {container} from "../../../styles/main";

class DagLeftMenu extends Component {
    constructor() {
        super();

        DagLeftMenuManager.registerLeftMenu(this);
    }

    toggle() {
        console.log('toggle-menu');
    }

    render() {
        return (
            <View style={container.flex}>{this.props.children}</View>
        );
    }
}

const styles = StyleSheet.create({

});

export default DagLeftMenu;
