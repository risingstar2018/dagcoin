(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('EditContactController', EditContactController);

  EditContactController.$inject = ['$stateParams', 'addressbookService', '$state'];

  function EditContactController($stateParams, addressbookService, $state) {
    const MAX_LENGTH_OF_DESCRIPTION = 500;
    const contact = this;
    contact.maxLengthOfContact = MAX_LENGTH_OF_DESCRIPTION;
    contact.data = {};
    const contactData = addressbookService.getContact($stateParams.address) || {};

    Object.keys(contactData).map((key) => {
      contact.data[key] = contactData[key];
      return true;
    });
    contact.description = contact.description || '';
    const descriptionLength = contact.description.length;
    contact.maxLengthOfContact = MAX_LENGTH_OF_DESCRIPTION < descriptionLength ? descriptionLength : MAX_LENGTH_OF_DESCRIPTION;
    contact.backParams = { address: $stateParams.address };

    contact.update = () => {
      console.log(contact.data);
      addressbookService.update(contact.data, (error, record) => {
        const exists = !!record;
        if (exists) {
          $state.go('contact', contact.backParams);
        }
      });
    };
  }
})();
