import * as types from './actionTypes';

export const deleteWallet = (wallet) => {
    return dispatch => {
        dispatch({type: types.DELETE_WALLET, wallet: wallet});
    };
};

export const editWallet = (wallet) => {
    return dispatch => {
        dispatch({type: types.EDIT_WALLET, wallet: wallet});
    };
};

export const addWallet = (wallet) => {
    return dispatch => {
        dispatch({type: types.ADD_WALLET, wallet: wallet});
    };
};
