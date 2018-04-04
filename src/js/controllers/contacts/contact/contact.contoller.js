(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('ContactController', ContactController);

  ContactController.$inject = ['addressbookService', '$stateParams', 'ngDialog', 'go', '$rootScope', '$timeout'];

  function ContactController(addressbookService, $stateParams, ngDialog, go, $rootScope, $timeout) {
    const contact = this;
    contact.data = addressbookService.getContact($stateParams.address) || {};

    contact.editContact = () => {
      ngDialog.open({
        template: 'controllers/contacts/contact/remove/removeContact.template.html',
        controller: 'RemoveContactModalCtrl'
      });
    };

    contact.sendPayment = function () {
      go.send(() => {
        $timeout(() => {
          $rootScope.$emit('paymentRequest', contact.data.address, null, 'base');
        }, 100);
      });
    };
  }
})();
