import * as types from './actionTypes';

export const deleteWallet = wallet => (dispatch) => {
  dispatch({ type: types.DELETE_WALLET, wallet });
};

export const editWallet = wallet => (dispatch) => {
  dispatch({ type: types.EDIT_WALLET, wallet });
};

export const addWallet = wallet => (dispatch) => {
  dispatch({ type: types.ADD_WALLET, wallet });
};
