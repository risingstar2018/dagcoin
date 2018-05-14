import React from 'react'
import {BackHandler, Platform} from "react-native";

export default class NavigationManager {
    static navigator: null;

    static registerNavigator(navigator) {
        NavigationManager.navigator = navigator;
    }

    static canBack() {
        return NavigationManager.navigator && NavigationManager.navigator.canBack();
    };

    static back() {
        NavigationManager.navigator.back();
    };

    static to(context, viewId, navParams) {
        NavigationManager.navigator.linkTo(context, viewId, navParams);
    };
}
