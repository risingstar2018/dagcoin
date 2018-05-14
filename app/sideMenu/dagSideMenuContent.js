import React, { Component } from 'react';

import Navigator from '../navigator/navigationManager';
import { routes } from '../navigator/routes';

import {
    View, Text, StyleSheet, Image
} from 'react-native';

import { container, text, font } from '../styles/main';
import DagSimpleButton from "../controls/dagSimpleButton";
import DagSideMenuManager from "./dagSideMenuManager";

class DagSideMenuContent extends Component {
    constructor() {
        super();

        this.state = {
            menuItems: [
                {
                    component: routes.NewWallet,
                    icon: require('../../img/add_black.png'),
                    text: 'Add new wallet'
                },
                {
                    component: routes.Contacts,
                    icon: require('../../img/contacts.png'),
                    text: 'Address Book'
                },
                {
                    component: routes.BackupSettings,
                    icon: require('../../img/share.png'),
                    text: 'Paired Devices'
                },
                {
                    component: routes.GlobalSettings,
                    icon: require('../../img/settings.png'),
                    text: 'Settings'
                }
            ]
        }
    }

    onLinkClick(action) {
        Navigator.to(this, action);
        DagSideMenuManager.toggle();
    }

    renderMenuItem(index, item) {
        return (<DagSimpleButton key={'menu-item-'+index}
            onClick={this.onLinkClick.bind(this, item.component)}
            style={StyleSheet.flatten([container.m30b, styles.menuItem])}
        >
            <View style={StyleSheet.flatten([container.m15r, styles.menuIcon])}>
                <Image style={StyleSheet.flatten([styles.menuIconImage])}
                       source={item.icon} />
            </View>
            <View style={StyleSheet.flatten([styles.menuItemText])}>
                <Text style={StyleSheet.flatten([text.textCenter, font.size16, font.weight400])}>{item.text}</Text>
            </View>
        </DagSimpleButton>);
    }

    render() {
        return (
            <View style={container.flex}>
                <View style={StyleSheet.flatten([container.p10, container.m20b, container.m20t, styles.infoContainer])}>
                    <View style={StyleSheet.flatten([styles.elementContainer])}>
                        <Image
                            style={StyleSheet.flatten([styles.logo])}
                            source={require('../../img/dagcoin_logo_menu.png')}
                        />
                    </View>
                    <View style={StyleSheet.flatten([container.m10t, styles.elementContainer])}>
                        <Text style={StyleSheet.flatten([text.grey, font.size12])}>
                            v1.4.5t
                        </Text>
                    </View>
                    <View style={StyleSheet.flatten([styles.elementContainer])}>
                        <Text style={StyleSheet.flatten([text.black, font.size14, font.weight600])}>
                            light wallet
                        </Text>
                    </View>
                </View>
                <View style={StyleSheet.flatten([container.m40t, container.m20l, container.p10t, styles.menuItemsContainer])}>
                    {this.state.menuItems.map((item, index) => {
                        return this.renderMenuItem(index, item);
                    })}
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    infoContainer: {
        alignContent: 'stretch'
    },
    elementContainer: {
        alignContent: 'stretch',
        alignItems: 'center'
    },
    logo: {
        width: 80,
        height: 24
    },
    menuItemsContainer: {
        justifyContent: 'flex-start'
    },
    menuItem: {
        justifyContent: 'flex-start',
        flexDirection: 'row'
    },
    menuItemText: {

    },
    menuIcon: {

    },
    menuIconImage: {
        width: 16,
        height: 16
    }
});

export default DagSideMenuContent;
