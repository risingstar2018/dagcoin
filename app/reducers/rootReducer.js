import { combineReducers } from 'redux';
import intro from './introReducer';
import contacts from './contactsReducer';
import general from './generalReducer';
import wallets from './walletsReducer';

const rootReducer = combineReducers({
    intro,
    contacts,
    general,
    wallets
});

export default rootReducer;
