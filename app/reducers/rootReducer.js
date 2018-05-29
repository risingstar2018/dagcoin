import { combineReducers } from 'redux';
import intro from './introReducer';
import contacts from './contactsReducer';
import general from './generalReducer';
import wallets from './walletsReducer';
import transactions from './transactionsReducer';

const rootReducer = combineReducers({
  intro,
  contacts,
  general,
  wallets,
  transactions
});

export default rootReducer;
