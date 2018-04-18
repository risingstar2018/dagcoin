import * as types from './actionTypes';

export const completeIntro = () => {
    return {type: types.COMPLETE_INTRO};
};

export const saveCompleteIntro = () => {
    return dispatch => {

        //TODO: save information about user complete intro

        dispatch(completeIntro());
    };
};
