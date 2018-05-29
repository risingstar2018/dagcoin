import * as types from './actionTypes';

export const changeWalletType = walletType => (dispatch) => {
  dispatch({ type: types.CHANGE_WALLET_TYPE, walletType });
};

export const changeDeviceName = deviceName => (dispatch) => {
  dispatch({ type: types.CHANGE_DEVICE_NAME, deviceName });
};
