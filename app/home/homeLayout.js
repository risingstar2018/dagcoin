import React, {Component} from 'react';

import {
    StyleSheet, Image, Platform
} from 'react-native';

import GeneralLayout from "../general/generalLayout";
import DagBottomMenu from "../controls/dagMenu/dagBottomMenu";
import BackgroundLayout from "../general/backgroundLayout";
import {container} from "../styles/main";
import Receive from "./receive";
import {routes} from '../navigator/routes';
import Navigator from '../navigator/navigationManager';

const MENU_ITEMS = {
    WALLET: 0,
    RECEIVE: 1,
    SEND: 2,
    PAIRED_DEVICES: 3
};

class HomeLayout extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedItem: this.props.selectedMenuItem,
            menuItems: [
                { title: 'My Wallet', component: routes.Wallet, icon: require('../../svg/wallet.svg')},
                { title: 'Receive', component: routes.Receive, icon: require('../../svg/download3.svg')},
                { title: 'Send', component: routes.Send, icon: require('../../svg/paperplane.svg')},
                { title: 'Paired Devices', component: routes.PairedDevices, icon: require('../../svg/paired_devices.svg')}
            ]
        }
    }

    onMenuChange(selectedItem) {
        const menuItem = this.state.menuItems[selectedItem];
        Navigator.to(this, menuItem.component);
    }

    render() {
        return (
            <GeneralLayout style={StyleSheet.flatten([styles.container])}>
                <BackgroundLayout style={StyleSheet.flatten([styles.container, container.p0])}>
                    {this.props.children}
                    <DagBottomMenu
                        onMenuChange={this.onMenuChange.bind(this)}
                        selectedItem={this.state.selectedItem}
                        items={this.state.menuItems}
                    />
                </BackgroundLayout>
            </GeneralLayout>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});

export {MENU_ITEMS};
export default HomeLayout;
