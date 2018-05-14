import React, {Component} from 'react';

import {
    StyleSheet, Image, Platform
} from 'react-native';

import GeneralLayout from "../general/generalLayout";
import PageHeader from "../general/pageHeader";
import DagBottomMenu from "../controls/dagMenu/dagBottomMenu";
import BackgroundLayout from "../general/backgroundLayout";
import {container} from "../styles/main";
import Receive from "./receive";
import DagSimpleButton from "../controls/dagSimpleButton";

class Home extends Component {
    constructor() {
        super();

        this.state = {
            selectedItem: 0,
            menuItems: [
                { title: 'My Wallet', inactiveIcon: require('../../img/wallet-gray.png'), activeIcon: require('../../img/wallet-red.png') },
                { title: 'Receive', inactiveIcon: require('../../img/download3-gray.png'), activeIcon: require('../../img/download3-red.png') },
                { title: 'Send', inactiveIcon: require('../../img/paperplane-gray.png'), activeIcon: require('../../img/paperplane-red.png') },
                { title: 'Paired Devices', inactiveIcon: require('../../img/paired_devices-gray.png'), activeIcon: require('../../img/paired_devices-red.png') }
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
            case 0:
                return null;
            case 1:
                return (<Receive {...this.props} />);
            case 2:
                return null;
            case 3:
                return null;
        }
    }

    onShareButtonClick() {
        console.log('share');
    }

    renderContactButton() {
        switch (this.state.selectedItem) {
            case 0:
                return null;
            case 1:
                if (Platform.OS === "web"){
                    return null;
                }

                return (
                    <DagSimpleButton style={StyleSheet.flatten([container.p20])} onClick={this.onShareButtonClick.bind(this)}>
                        <Image source={require('../../img/share-white.png')} style={styles.shareIcon} />
                    </DagSimpleButton>
                );
            case 2:
                return null;
            case 3:
                return null;
        }
    }

    render() {
        return (
            <GeneralLayout style={StyleSheet.flatten([styles.container])}>
                <PageHeader color={'red'}
                            hasMenu={true}
                            title={'Wallet #1'.toUpperCase()}
                            renderCustomAction={this.renderContactButton.bind(this)}
                />
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
    },
    shareIcon: {
        width: 20,
        height: 20
    }
});

export default Home;
