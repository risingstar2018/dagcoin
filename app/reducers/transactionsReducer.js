import initialState from './initialState';
import { UPDATE_TRANSACTIONS } from '../actions/actionTypes';

export default (state = initialState.transactions, action) => {
    switch (action.type) {
        case UPDATE_TRANSACTIONS:
            return action.transactions.map(x => x);
        default:
            return state;
    }
};
