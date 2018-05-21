import initialState from './initialState';
import * as types from '../actions/actionTypes';

export default (state = initialState.general, action) => {
    switch (action.type) {
        case types.CHANGE_WALLET_TYPE:
            return Object.assign(state, { walletType: action.walletType });
        case types.CHANGE_DEVICE_NAME:
            return Object.assign(state, { deviceName: action.deviceName });
        case types.TOGGLE_VISIBILITY:
            return Object.assign(state, { visibility: !state.visibility});
        default:
            return state;
    }
};
