import { combineReducers } from 'redux';
import intro from './introReducer';
import contacts from './contactsReducer';

const rootReducer = combineReducers({
    intro,
    contacts
});

export default rootReducer;
