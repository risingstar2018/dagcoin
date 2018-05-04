import React, {Component} from 'react';

import {
    StyleSheet
} from 'react-native';

import GeneralLayout from "../general/generalLayout";
import PageHeader from "../general/pageHeader";
import DagBottomMenu from "../controls/dagMenu/dagBottomMenu";
import BackgroundLayout from "../general/backgroundLayout";
import {container} from "../styles/main";

class Wallet extends Component {
    constructor() {
        super();

        this.state = {
            selectedItem: 0,
            menuItems: [
                { title: 'My Wallet', inactiveIcon: require('../../img/wallet-gray.png'), activeIcon: require('../../img/wallet-red.png') },
                { title: 'Receive', inactiveIcon: require('../../img/download3-gray.png'), activeIcon: require('../../img/download3-red.png') },
                { title: 'Send', inactiveIcon: require('../../img/paperplane-gray.png'), activeIcon: require('../../img/paperplane-red.png') },
                { title: 'Send', inactiveIcon: require('../../img/paired_devices-gray.png'), activeIcon: require('../../img/paired_devices-red.png') }
            ]
        }
    }

    onMenuChange(selectedItem) {
        this.setState({
            selectedItem: selectedItem
        });
    }

    renderContent() {
        switch (this.state.selectedItem) {
            case 1:
            case 2:
            case 3:
            case 4:
                return null;
        }
    }

    render() {
        return (
            <GeneralLayout style={StyleSheet.flatten([styles.container])}>
                <PageHeader color={'red'} hasMenu={true} title={'Wallet #1'.toUpperCase()}></PageHeader>
                <BackgroundLayout style={StyleSheet.flatten([styles.container, container.p0])}>
                    {this.renderContent()}
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

export default Wallet;
