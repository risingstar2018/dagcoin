(function () {
  'use strict';

  angular
    .module('copayApp.services')
    .factory('autoRefreshClientService', autoRefreshClientService);

  autoRefreshClientService.$inject = ['$rootScope', '$interval'];

  /* @ngInject */
  function autoRefreshClientService($rootScope, $interval) {
    const settings = {
      autoRefreshRateSec: 60
    };

    function initHistoryAutoRefresh() {
      const refreshRate = settings.autoRefreshRateSec * 1000;

      $interval(() => {
        const lightWallet = require('byteballcore/light_wallet.js');

        lightWallet.refreshLightClientHistory();
      }, refreshRate);
    }

    return {
      initHistoryAutoRefresh
    };
  }
}());

