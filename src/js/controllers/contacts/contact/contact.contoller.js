(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('ContactController', ContactController);

  ContactController.$inject = ['addressbookService', '$stateParams', 'ngDialog'];

  function ContactController(addressbookService, $stateParams, ngDialog) {
    const contact = this;
    contact.data = addressbookService.getContact($stateParams.address) || {};

    contact.editContact = () => {
      ngDialog.open({
        template: 'controllers/contacts/contact/edit_modal.template.html',
        controller: 'EditContactModalController'
      });
    };
  }
})();
