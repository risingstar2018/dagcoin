import * as types from './actionTypes';

import configStorage from '../services/storage/configStorage';
import settingsStorage from '../services/storage/settingsStorage';

export const changeWalletType = walletType => dispatch => new Promise((resolve) => {
  configStorage.setWalletType(walletType).then(() => {
    dispatch({ type: types.CHANGE_WALLET_TYPE, walletType });
    resolve();
  });
});

export const changeDeviceName = deviceName => dispatch => new Promise((resolve) => {
  settingsStorage.setDeviceName(deviceName).then(() => {
    dispatch({ type: types.CHANGE_DEVICE_NAME, deviceName });
    resolve();
  });
});

export const init = () => dispatch => new Promise((resolve, reject) => {
  const confPromise = configStorage.getAll();
  const settingsPromise = settingsStorage.getAll();

  Promise.all([confPromise, settingsPromise]).then((values) => {
    let initialState = {};

    values.forEach((v) => {
      initialState = Object.assign({}, initialState, v);
    });

    dispatch({ type: types.APP_SETTINGS_INIT, initialState });
    resolve();
  });
});

export const toggleVisibility = () => {
    return dispatch => {
        dispatch({type: types.TOGGLE_VISIBILITY});
    };
};
