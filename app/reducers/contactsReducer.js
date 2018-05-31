import initialState from './initialState';
import { UPDATE_CONTACTS } from '../actions/actionTypes';

export default (state = initialState.contacts, action) => {
  switch (action.type) {
    case UPDATE_CONTACTS:
      return action.contacts.map(x => x);
    default:
      return state;
  }
};
