import React, {Component} from 'react';

import {
    StyleSheet, View, Text, Image, TouchableOpacity
} from 'react-native';

import {container, font, text} from "../styles/main";
import DagIconButton from "../controls/dagIconButton";

class PageHeader extends Component {
    constructor() {
        super();

        this.renderBackIcon = this.renderBackIcon.bind(this);
        this.renderMenuIcon = this.renderMenuIcon.bind(this);
        this.renderCustomAction = this.renderCustomAction.bind(this);
    }

    onBackClick() {
        console.log('back button');
    }

    onMenuClick() {
        console.log('menu');
    }

    renderCustomAction() {
        if (this.props.renderCustomAction) {
            return this.props.renderCustomAction();
        }

        return null;
    }

    renderBackIcon() {
        if (!!this.props.canBack) {
            const icon = this.props.color === 'red'
                ? require('../../img/chevron-left-thin-white.png')
                : require('../../img/chevron-left-thin-red.png');

            return (
                <DagIconButton onClick={this.onBackClick.bind(this)}>
                    <Image style={styles.backIcon} source={icon}></Image>
                </DagIconButton>
            );
        }
        return null;
    }

    renderMenuIcon() {
        if (!!this.props.hasMenu) {
            const icon = this.props.color === 'red'
                ? require('../../img/menu-white.png')
                : require('../../img/menu-red.png');

            return (
                <DagIconButton style={styles.actionButton} onClick={this.onMenuClick.bind(this)}>
                    <Image style={styles.menuIcon} source={icon}></Image>
                </DagIconButton>
            );
        }
        return null;
    }

    render() {
        return (
            <View style={StyleSheet.flatten([
                container.p15,
                this.props.color === 'red' ? container.backgroundRed : container.transparent,
                styles.container,
                this.props.style
            ])}>
                <View style={styles.actionButtonContainer}>
                    {this.renderBackIcon()}
                    {this.renderMenuIcon()}
                </View>
                <View style={StyleSheet.flatten([styles.textContainer])}>
                    <Text style={StyleSheet.flatten([
                        font.size16,
                        font.weight600,
                        text.textCenter,
                        this.props.color === 'red' ? text.textWhite : text.textRed
                    ])}>{this.props.title}</Text>
                </View>
                <View style={styles.actionButtonContainer}>
                    {this.renderCustomAction()}
                </View>
            </View>
        );
    }
}

PageHeader.defaultProps = {
    color: 'transparent'
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50
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
