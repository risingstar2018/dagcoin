(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('TransactionController', TransactionController);

  TransactionController.$inject = ['$stateParams'];

  function TransactionController($stateParams) {
    const transaction = this;
    transaction.address = $stateParams.address;
  }
})();
