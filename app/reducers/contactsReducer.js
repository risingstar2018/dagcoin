import initialState from './initialState';
import { DELETE_CONTACT, ADD_CONTACT, EDIT_CONTACT, ADD_FAVORITE_CONTACT, REMOVE_FAVORITE_CONTACT } from '../actions/actionTypes';

export default (state = initialState.contacts, action) => {
  const contacts = state.map(x => x);
  let contact = null;

  switch (action.type) {
    case DELETE_CONTACT:
      return contacts.filter(c => c.address !== action.contact.address);
    case ADD_CONTACT:
      contacts.push(action.contact);
      return contacts;
    case EDIT_CONTACT:
      contact = contacts.find(c => c.address === action.contact.address);
      contact = Object.assign(contact, action.contact);
      return contacts;
    case ADD_FAVORITE_CONTACT:
      contact = contacts.find(c => c.address === action.contact.address);
      contact.isFavorite = true;
      return contacts;
    case REMOVE_FAVORITE_CONTACT:
      contact = contacts.find(c => c.address === action.contact.address);
      contact.isFavorite = false;
      return contacts;
    default:
      return contacts;
  }
};
