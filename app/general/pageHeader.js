import React, {Component} from 'react';

import {
    StyleSheet, View, Text, Image
} from 'react-native';

import {container, font, text} from "../styles/main";
import DagSimpleButton from "../controls/dagSimpleButton";
import NavigationManager from "../navigator/navigationManager";
import DagSideMenuManager from "../sideMenu/dagSideMenuManager";

class PageHeader extends Component {
    constructor() {
        super();

        this.renderBackIcon = this.renderBackIcon.bind(this);
        this.renderMenuIcon = this.renderMenuIcon.bind(this);
        this.renderCustomAction = this.renderCustomAction.bind(this);
    }

    onBackClick() {
        NavigationManager.back();
    }

    onMenuClick() {
        DagSideMenuManager.toggle();
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
                <DagSimpleButton style={StyleSheet.flatten([container.p20])} onClick={this.onBackClick.bind(this)}>
                    <Image style={styles.backIcon} source={icon} />
                </DagSimpleButton>
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
                <DagSimpleButton style={StyleSheet.flatten([container.p20])} onClick={this.onMenuClick.bind(this)}>
                    <Image style={styles.menuIcon} source={icon} />
                </DagSimpleButton>
            );
        }
        return null;
    }

    render() {
        return (
            <View style={StyleSheet.flatten([
                this.props.color === 'red' ? container.backgroundRed : container.transparent,
                styles.container,
                this.props.style
            ])}>
                <View style={StyleSheet.flatten([styles.actionButtonContainer, container.flexLeft])}>
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
                <View style={StyleSheet.flatten([styles.actionButtonContainer, container.flexRight])}>
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
        height: 16,
        alignSelf: 'flex-start'
    },
    menuIcon: {
        width: 27,
        height: 27,
        alignSelf: 'flex-start'
    },
    textContainer: {
        flex: 1,
        alignItems: 'center'
    },
    actionButtonContainer: {
        width: 50,
        height: 50,
        display: 'flex',
        justifyContent: 'center'
    }
});

export default PageHeader;
