import * as types from './actionTypes';

export const deleteContact = (contact) => {
    return dispatch => {
        dispatch({type: types.DELETE_CONTACT, contact: contact});
    };
};

export const editContact = (contact) => {
    return dispatch => {
        dispatch({type: types.EDIT_CONTACT, contact: contact});
    };
};

export const addContact = (contact) => {
    return dispatch => {
        dispatch({type: types.ADD_CONTACT, contact: contact});
    };
};

export const addFavoriteContact = (contact) => {
    return dispatch => {
        dispatch({type: types.ADD_FAVORITE_CONTACT, contact: contact});
    };
};

export const removeFavoriteContact = (contact) => {
    return dispatch => {
        dispatch({type: types.REMOVE_FAVORITE_CONTACT, contact: contact});
    };
};
