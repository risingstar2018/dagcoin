import initialState from './initialState';
import { DELETE_WALLET, EDIT_WALLET, ADD_WALLET } from '../actions/actionTypes';

export default (state = initialState.wallets, action) => {
    let wallets = state.map(x => x);
    let wallet = null;

    switch (action.type) {
        case DELETE_WALLET:
            return wallets.filter(w => w.address !== action.wallet.address);
        case ADD_WALLET:
            wallets.push(action.wallet);
            return wallets;
        case EDIT_WALLET:
            wallet = wallets.find(w => w.address === action.wallet.address);
            wallet = Object.assign(wallet, action.wallet);
            return wallets;
        default:
            return wallets;
    }
};
