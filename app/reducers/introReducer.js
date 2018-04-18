import initialState from './initialState';
import { COMPLETE_INTRO } from '../actions/actionTypes';

export default (state = initialState.intro, action) => {
    switch (action.type) {
        case COMPLETE_INTRO:
            console.log('COMPLETE_INTRO Action');
            return action;
        default:
            return state;
    }
};
