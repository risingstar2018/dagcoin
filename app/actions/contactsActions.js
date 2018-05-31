import * as types from './actionTypes';

import contactsStorage from './../services/storage/contactsStorage';

export const deleteContact = contact => dispatch => new Promise((resolve) => {
  contactsStorage.getContacts().then((contacts) => {
    const newContacts = contacts.filter(c => c.address !== contact.address);

    contactsStorage.setContacts(newContacts).then(() => {
      dispatch({ type: types.UPDATE_CONTACTS, contacts: newContacts });
      resolve();
    });
  });
});

export const editContact = contact => dispatch => new Promise((resolve) => {
  contactsStorage.getContacts().then((contacts) => {
    const c = contacts.find(c => c.address === contact.address);
    Object.assign(c, contact);

    contactsStorage.setContacts(contacts).then(() => {
      dispatch({ type: types.UPDATE_CONTACTS, contacts });
      resolve();
    });
  });
});

export const addContact = contact => dispatch => new Promise((resolve) => {
  contactsStorage.getContacts().then((contacts) => {
    contacts.push(contact);

    contactsStorage.setContacts(contacts).then(() => {
      dispatch({ type: types.UPDATE_CONTACTS, contacts });
      resolve();
    });
  });
});

export const addFavoriteContact = contact => dispatch => new Promise((resolve) => {
  contactsStorage.getContacts().then((contacts) => {
    const c = contacts.find(c => c.address === contact.address);
    c.isFavorite = true;

    contactsStorage.setContacts(contacts).then(() => {
      dispatch({ type: types.UPDATE_CONTACTS, contacts });
      resolve();
    });
  });
});

export const removeFavoriteContact = contact => dispatch => new Promise((resolve) => {
  contactsStorage.getContacts().then((contacts) => {
    const c = contacts.find(c => c.address === contact.address);
    c.isFavorite = false;

    contactsStorage.setContacts(contacts).then(() => {
      dispatch({ type: types.UPDATE_CONTACTS, contacts });
      resolve();
    });
  });
});

export const initContacts = () => dispatch => new Promise((resolve) => {
  contactsStorage.getContacts().then((contacts) => {
    dispatch({ type: types.UPDATE_CONTACTS, contacts });
    resolve();
  });
});
