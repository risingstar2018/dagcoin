import React, {Component} from 'react';

import {
    StyleSheet, Text, Image, Dimensions, View
} from 'react-native';
import BottomToolbar from 'react-native-bottom-toolbar';

class DagLeftMenuManager extends Component {
    static menu = null;

    static registerLeftMenu(menu){
        DagLeftMenuManager.menu = menu;
    }

    static toggle() {
        this.menu.toggle();
    }
}

export default DagLeftMenuManager;
