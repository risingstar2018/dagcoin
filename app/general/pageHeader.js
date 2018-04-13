import React, {Component} from 'react';

import {
    StyleSheet, View, Text, Image, TouchableOpacity
} from 'react-native';

import {container, font} from "../styles/main";

class PageHeader extends Component {
    constructor() {
        super();

        this.renderBackIcon = this.renderBackIcon.bind(this);
        this.renderMenuIcon = this.renderMenuIcon.bind(this);
        this.onBackClick = this.onBackClick.bind(this);
        this.onMenuClick = this.onMenuClick.bind(this);
    }

    onBackClick() {
        console.log('back button');
    }

    onMenuClick() {
        console.log('back menu');
    }

    renderBackIcon() {
        if (!!this.props.canBack) {
            return (
                <TouchableOpacity onPress={() => this.onBackClick()}>
                    <Image style={styles.backIcon} source={require('../../img/chevron-left-thin-red.png')}></Image>
                </TouchableOpacity>
            );
        }
        return null;
    }

    renderMenuIcon() {
        if (!!this.props.hasMenu) {
            return (
                <TouchableOpacity style={styles.actionButton} onPress={() => this.onMenuClick()}>
                    <Image style={styles.menuIcon} source={require('../../img/menu-red.png')}></Image>
                </TouchableOpacity>
            );
        }
        return null;
    }

    render() {
        return (
            <View style={StyleSheet.flatten([container.p15, styles.container, this.props.style])}>
                <View style={styles.actionButtonContainer}>
                    {this.renderBackIcon()}
                    {this.renderMenuIcon()}
                </View>
                <View style={StyleSheet.flatten([styles.textContainer])}>
                    <Text style={StyleSheet.flatten([styles.title, font.size16, font.weight600])}>{this.props.title}</Text>
                </View>
                <View style={styles.actionButtonContainer}>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        textAlign: 'center',
        color: '#d51f26'
    },
    backIcon: {
        width: 16,
        height: 16
    },
    menuIcon: {
        width: 27,
        height: 27
    },
    textContainer: {
        flex: 1,
        alignItems: 'center'
    },
    actionButtonContainer: {
        width: 30,
        height: 30,
        display: 'flex',
        justifyContent: 'center'
    },
    actionButton: {
    }
});

export default PageHeader;
