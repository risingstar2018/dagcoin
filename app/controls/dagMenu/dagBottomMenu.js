import React, {Component} from 'react';

import {
    StyleSheet, Text, Dimensions, View
} from 'react-native';
import BottomToolbar from 'react-native-bottom-toolbar';
import DagSvg from '../dagSvg/dagSvg';

class DagBottomMenu extends Component {
    constructor() {
        super();

        this.renderMenuItem = this.renderMenuItem.bind(this);
    }

    renderMenuItem(item, index) {
        return (
            <BottomToolbar.Action
                key={'menu-item-' + index}
                title="Wallet"
                onPress={this.props.onMenuChange.bind(this)}
                IconElement={this.renderMenuItemContent(this.props.selectedItem === index, item.title, item.icon)}
            />
        );
    }

    renderMenuItemContent(isActive, title, icon) {
        return (<View style={StyleSheet.flatten([styles.tab, isActive ? styles.activeTab : null])}>
            <DagSvg width={20}
                    height={20}
                    source={icon}
                    fill={isActive ? '#d51f26' : '#cecece'}
            />
            <Text style={StyleSheet.flatten([styles.actionTitle, isActive ? styles.activeActionTitle : null])}>{title}</Text>
        </View>);
    }

    render() {
        return (
            <BottomToolbar
                wrapperStyle={styles.menu}
                buttonStyle={styles.tab}
            >
                {
                    this.props.items.map((item, index) => {
                        return this.renderMenuItem(item, index);
                    })
                }
            </BottomToolbar>
        );
    }
}

const styles = StyleSheet.create({
    container: {},
    menu: {
        height: 50,
        position: 'absolute',
        left: 0,
        bottom: 1,
        right: 0,
        backgroundColor: 'transparent',
        paddingLeft: 10,
        paddingRight: 10,
        borderTopColor: '#f8f8f8'
    },
    buttonStyle: {
        padding: 0,
        margin: 0
    },
    activeTab: {
        borderTopColor: '#d51f26',
    },
    tab: {
        borderTopWidth: 2,
        borderStyle: 'solid',
        borderTopColor: '#ffffff',
        height: 50,
        justifyContent: 'center',
        width: (Dimensions.get('window').width - 20) / 4,
        alignItems: 'center'
    },
    activeActionTitle: {
        color: '#d51f26'
    },
    actionTitle: {
        fontSize: 10,
        color: '#cecece'
    }
});

export default DagBottomMenu;