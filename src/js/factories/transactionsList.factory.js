(() => {
  'use strict';

  angular
    .module('copayApp.services')
    .factory('transactionsList', transactionsList);

  transactionsList.$inject = ['$q'];

  function transactionsList($q) {
    return {
      get
    };

    function get() {
      return $q((resolve) => {
        resolve();
      });
    }
  }
})();
