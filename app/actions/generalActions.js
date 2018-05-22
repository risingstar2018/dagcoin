import * as types from './actionTypes';

import configStorage from '../services/storage/configStorage';
import settingsStorage from '../services/storage/settingsStorage';

export const changeWalletType = (walletType) => {
    return dispatch => {
        return new Promise((resolve) => {
            configStorage.setWalletType(walletType).then(() => {
                dispatch({type: types.CHANGE_WALLET_TYPE, walletType: walletType});
                resolve();
            });
        });
    };
};

export const changeDeviceName = (deviceName) => {
    return dispatch => {
        return new Promise((resolve) => {
            settingsStorage.setDeviceName(deviceName).then(() => {
                dispatch({type: types.CHANGE_DEVICE_NAME, deviceName: deviceName});
                resolve();
            });
        });
    };
};

export const init = () => {
    return dispatch => {
        return new Promise((resolve, reject) => {
            const confPromise = configStorage.getAll();
            const settingsPromise = settingsStorage.getAll();

            Promise.all([confPromise, settingsPromise]).then((values) => {
                let initialState = {};

                values.forEach((v) => {
                    initialState = Object.assign({}, initialState, v);
                });

                dispatch({type: types.APP_SETTINGS_INIT, initialState: initialState});
                resolve();
            });
        });
    };
};
