import * as types from './actionTypes';

export const deleteContact = contact => (dispatch) => {
  dispatch({ type: types.DELETE_CONTACT, contact });
};

export const editContact = contact => (dispatch) => {
  dispatch({ type: types.EDIT_CONTACT, contact });
};

export const addContact = contact => (dispatch) => {
  dispatch({ type: types.ADD_CONTACT, contact });
};

export const addFavoriteContact = contact => (dispatch) => {
  dispatch({ type: types.ADD_FAVORITE_CONTACT, contact });
};

export const removeFavoriteContact = contact => (dispatch) => {
  dispatch({ type: types.REMOVE_FAVORITE_CONTACT, contact });
};
