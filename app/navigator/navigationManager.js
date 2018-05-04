import React from 'react'

export default class NavigationManager {
    static navigator: null;

    static registerNavigator(navigator) {
        NavigationManager.navigator = navigator;
    }

    static back() {
        NavigationManager.navigator.back();
    };

    static to(context, viewId, navParams) {
        NavigationManager.navigator.linkTo(context, viewId, navParams);
    };
}
