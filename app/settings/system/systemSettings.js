import React, {Component} from 'react';

import {
    StyleSheet
} from 'react-native';

import {container} from "../../styles/main";
import DagListView from "../../controls/dagListView/dagListView";
import SettingsPageLayout from "../settingsPageLayout";
import Navigator from '../../navigator/navigationManager';
import { routes } from '../../navigator/routes';
import DagModalManager from "../../controls/dagModal/dagModalManager";
import ChangeWalletTypeModal from "../../controls/dagModal/modals/changeWalletTypeModal";
import {connect} from "react-redux";
import { changeWalletType } from '../../actions/generalActions';
import {FULL_WALLET, LIGHT_WALLET} from "../../constants/walletType";

class SystemSettings extends Component {
    onChangeWalletType() {
        const newWalletType = this.props.walletType === LIGHT_WALLET ? FULL_WALLET : LIGHT_WALLET;
        this.props.changeWalletType(newWalletType);
        DagModalManager.hide();
    }

    onCancel() {
        DagModalManager.hide();
    }

    render() {
        const options = [
            {
                title: 'Device name',
                description: this.props.deviceName,
                onClick: () => {
                    Navigator.to(this, routes.DeviceNameSettings);
                }
            },
            {
                title: 'Change Wallet type',
                description: this.props.walletType === LIGHT_WALLET ? 'light wallet' : 'full wallet',
                onClick: () => {
                    if (this.props.walletType === LIGHT_WALLET) {
                        DagModalManager.show(<ChangeWalletTypeModal
                            onChange={this.onChangeWalletType.bind(this)}
                            onCancel={this.onCancel.bind(this)} />);
                    }
                    else {
                        this.onChangeWalletType();
                    }
                }
            }
        ];

        return (
            <SettingsPageLayout canBack={true} title={'System'.toUpperCase()}>
                <DagListView style={container.m10b} options={options}/>
            </SettingsPageLayout>
        );
    }
}

const styles = StyleSheet.create({

});

function mapStateToProps(state) {
    return {
        deviceName: state.general.deviceName,
        walletType: state.general.walletType
    };
}

const mapDispatchToProps = {
    changeWalletType
};

export default connect(mapStateToProps, mapDispatchToProps)(SystemSettings);
