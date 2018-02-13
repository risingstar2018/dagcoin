(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('EditContactController', EditContactController);

  EditContactController.$inject = ['$stateParams', 'addressbookService', '$state'];

  function EditContactController($stateParams, addressbookService, $state) {
    const MAX_LENGTH_OF_DESCRIPTION = 500;
    const contact = this;
    contact.backParams = { address: $stateParams.address };
    let contactData = {};
    contact.maxLengthOfContact = MAX_LENGTH_OF_DESCRIPTION;

    contact.update = () => {
      contactData.first_name = contact.first_name;
      contactData.last_name = contact.last_name;
      contactData.email = contact.email;
      contactData.description = contact.description;

      addressbookService.update(contactData, () => {
        $state.go('contact', contact.backParams);
      });
    };

    contact.address = $stateParams.address;
    addressbookService.getContact(contact.address, (err, data) => {
      contactData = data;
      Object.keys(data).map((key) => {
        contact[key] = data[key] || '';
        return true;
      });
      contact.description = contact.description || '';
      const descriptionLength = contact.description.length;
      contact.maxLengthOfContact = MAX_LENGTH_OF_DESCRIPTION < descriptionLength ? descriptionLength : MAX_LENGTH_OF_DESCRIPTION;
    });
  }
})();
