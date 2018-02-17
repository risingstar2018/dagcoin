(() => {
  'use strict';

  angular
    .module('dagcoin.controllers')
    .controller('TransactionsController', TransactionsController);

  TransactionsController.$inject = ['$stateParams'];

  function TransactionsController($stateParams) {
    const transactions = this;
    transactions.address = $stateParams.address;
  }
})();
