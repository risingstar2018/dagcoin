import * as types from './actionTypes';

export const changeWalletType = (walletType) => {
    return dispatch => {
        dispatch({type: types.CHANGE_WALLET_TYPE, walletType: walletType});
    };
};

export const changeDeviceName = (deviceName) => {
    return dispatch => {
        dispatch({type: types.CHANGE_DEVICE_NAME, deviceName: deviceName});
    };
};

export const toggleVisibility = () => {
    return dispatch => {
        dispatch({type: types.TOGGLE_VISIBILITY});
    };
};
