import React, {Component} from 'react';

import {
    StyleSheet, View, Text, Image
} from 'react-native';

import {container, font, text} from "../styles/main";
import DagSimpleButton from "../controls/dagSimpleButton";
import NavigationManager from "../navigator/navigationManager";
import DagSideMenuManager from "../sideMenu/dagSideMenuManager";
import DagSvg from '../controls/dagSvg/dagSvg';

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
            const icon = require('../../svg/chevron-left-thin.svg');
            const color = this.props.color === 'red' ? '#ffffff' : '#d51f26';

            return (
                <DagSimpleButton style={StyleSheet.flatten([container.p20])} onClick={this.onBackClick.bind(this)}>
                    <DagSvg width={16}
                            height={16}
                            source={icon}
                            fill={color}
                            style={styles.backIcon}
                    />
                </DagSimpleButton>
            );
        }
        return null;
    }

    renderMenuIcon() {
        if (!!this.props.hasMenu) {
            const icon = require('../../svg/menu.svg');
            const color = this.props.color === 'red' ? '#ffffff' : '#d51f26';

            return (
                <DagSimpleButton style={StyleSheet.flatten([container.p20])} onClick={this.onMenuClick.bind(this)}>
                    <DagSvg width={27}
                            height={27}
                            source={icon}
                            fill={color}
                            style={styles.menuIcon}
                    />
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
        alignSelf: 'flex-start'
    },
    menuIcon: {
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
