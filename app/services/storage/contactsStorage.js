import BaseStorage from './baseStorage';

class ContactsStorage extends BaseStorage {
    constructor() {
        super("contacts.json");
    }

    setContacts(contacts) {
        return this.set("contacts", contacts);
    }

    getContacts() {
        return this.get("contacts", []);
    }
}

export default new ContactsStorage();
