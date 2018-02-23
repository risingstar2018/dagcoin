(function () {
  'use strict';

  angular
    .module('copayApp.services')
    .factory('sharedService', sharedService);

  sharedService.$inject = ['$rootScope', 'ENV'];

  /* @ngInject */
  function sharedService($rootScope) {
    const service = {};
    const balanceStatuses = {
      total: 'total',
      pending: 'pending',
      stable: 'stable'
    };

    service.balanceStatuses = balanceStatuses;
    service.hasBalance = hasBalance;
    service.hasBytes = hasBytes;

    let currentBalance = null;

    $rootScope.$on('Local/BalanceUpdatedAndWalletUnlocked', (event, ab) => {
      currentBalance = ab;
    });

    function hasBalance(status) {
      return hasBytes(status);
    }

    function hasBytes(status) {
      const st = status || balanceStatuses.stable;
      return (currentBalance && currentBalance.base && currentBalance.base[st] > 0);
    }

    return service;
  }
}());

