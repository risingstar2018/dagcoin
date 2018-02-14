(() => {
  'use strict';

  angular
    .module('copayApp.services')
    .factory('addressbookService', addressbookService);

  addressbookService.$inject = ['storageService', 'profileService'];

  function addressbookService(storageService, profileService) {
    let contacts = false;

    return {
      getContact,
      list,
      favorites,
      add,
      update,
      remove
    };

    function addressBookKey() {
      const fc = profileService.focusedClient;
      const network = fc.credentials.network;
      return `addressbook-${network}`;
    }

    /**
     * Get contact by wallet address
     * @param address address of the wallet
     * @returns {*}
     */

    function getContact(address) {
      return list(() => (contacts[address] || false));
    }

    /**
     * Collect object of all existing contacts from the storage service
     * @param cb Callback function
     * @returns {*}
     */
    function list(cb) {
      if (!contacts) {
        storageService.get(addressBookKey(), (error, contactList) => {
          if (contactList) {
            const json = JSON.parse(contactList);
            contacts = {};

            Object.keys(json).map((address) => {
              if (typeof json[address] === 'string') {
                contacts[address] = {
                  address,
                  first_name: json[address].split(' ')[0],
                  last_name: json[address].split(' ')[1]
                };
              } else if (json[address].first_name) {
                contacts[address] = json[address];
              }
              return true;
            });
          } else {
            contacts = {};
          }
        });
      }
      return cb(contacts);
    }

    /**
     * Filter all existing contacts by their param "favorite = true"
     * @returns {*}
     */
    function favorites() {
      return list(() => {
        const favoritesList = [];

        Object.keys(contacts).map((address) => {
          const contact = contacts[address];
          if (contact.favorite) {
            favoritesList.push(contact);
          }
          return true;
        });

        return favoritesList;
      });
    }

    /**
     * Add a new entry to existing contacts
     * @returns boolean
     */
    function add(entry, cb) {
      return list(() => {
        contacts[entry.address] = entry;
        storageService.set(addressBookKey(), JSON.stringify(contacts), cb);
      });
    }

    function update(entry, cb) {
      return list(() => {
        Object.keys(entry).map((key) => {
          contacts[entry.address][key] = entry[key];
          return true;
        });
        storageService.set(addressBookKey(), JSON.stringify(contacts), cb);
      });
    }

    function remove(addr, cb) {
      return list(() => {
        delete contacts[addr];
        storageService.set(addressBookKey(), JSON.stringify(contacts), cb);
      });
    }
  }
})();
