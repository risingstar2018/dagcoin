(() => {
  'use strict';

  angular
    .module('dagcoin.controllers')
    .controller('TransactionController', TransactionController);

  TransactionController.$inject = ['$stateParams'];

  function TransactionController($stateParams) {
    const transaction = this;
    transaction.address = $stateParams.address;
  }
})();
