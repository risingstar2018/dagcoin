import React from 'react';

import Navigator from '../navigator/navigationManager';
import { routes } from '../navigator/routes';

import {
    View, Text, StyleSheet, Image, TouchableOpacity, Dimensions
} from 'react-native';

import { container, text, font } from '../styles/main';

function getMenu() {
    return (
        <View style={{flexDirection: 'column'}}>
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
                <TouchableOpacity
                    onPress={onPress.bind(this, 1, routes.NewWallet)}
                    style={StyleSheet.flatten([container.m30b, styles.menuItem])}
                >
                    <View style={StyleSheet.flatten([container.m15r, styles.menuIcon])}>
                        <Image
                            style={StyleSheet.flatten([styles.menuIconImage])}
                            source={require('../../img/add_black.png')}
                        />
                    </View>
                    <View style={StyleSheet.flatten([styles.menuItemText])}>
                        <Text style={StyleSheet.flatten([text.textCenter, font.size16, font.weight400])}>Add new wallet</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={onPress.bind(this, 1, routes.Contacts)}
                    style={StyleSheet.flatten([container.m30b, styles.menuItem])}
                >
                    <View style={StyleSheet.flatten([container.m15r, styles.menuIcon])}>
                        <Image
                            style={StyleSheet.flatten([styles.menuIconImage])}
                            source={require('../../img/contacts.png')}
                        />
                    </View>
                    <View style={StyleSheet.flatten([styles.menuItemText])}>
                        <Text style={StyleSheet.flatten([text.textCenter, font.size16, font.weight400])}>Address Book</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={onPress.bind(this, 1, routes.BackupSettings)}
                    style={StyleSheet.flatten([container.m30b, styles.menuItem])}
                >
                    <View style={StyleSheet.flatten([container.m15r, styles.menuIcon])}>
                        <Image
                            style={StyleSheet.flatten([styles.menuIconImage])}
                            source={require('../../img/share.png')}
                        />
                    </View>
                    <View style={StyleSheet.flatten([styles.menuItemText])}>
                        <Text style={StyleSheet.flatten([text.textCenter, font.size16, font.weight400])}>Paired Devices</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={onPress.bind(this, 1, routes.GlobalSettings)}
                    style={StyleSheet.flatten([container.m30b, styles.menuItem])}
                >
                    <View style={StyleSheet.flatten([container.m15r, styles.menuIcon])}>
                        <Image
                            style={StyleSheet.flatten([styles.menuIconImage])}
                            source={require('../../img/settings.png')}
                        />
                    </View>
                    <View style={StyleSheet.flatten([styles.menuItemText])}>
                        <Text style={StyleSheet.flatten([text.textCenter, font.size16, font.weight400])}>Settings</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

function onPress(menuItemIdx, action) {

    Navigator.to(this, action)
}

const styles = StyleSheet.create({
    infoContainer: {
        flex: 1,
        alignContent: 'stretch'
    },
    elementContainer: {
        flex: 1,
        alignContent: 'stretch',
        alignItems: 'center'
    },
    logo: {
        width: 80,
        height: 24
    },
    menuItemsContainer: {
        flex: 1,
        justifyContent: 'flex-start'
    },
    menuItem: {
        flex: 1,
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

export { getMenu };
