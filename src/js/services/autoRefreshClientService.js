(function () {
  'use strict';

  angular
    .module('copayApp.services')
    .factory('autoRefreshClientService', autoRefreshClientService);

  autoRefreshClientService.$inject = ['$interval'];

  /* @ngInject */
  function autoRefreshClientService($interval) {
    const settings = {
      autoRefreshRateSec: 60
    };

    function initHistoryAutoRefresh() {
      const refreshRate = settings.autoRefreshRateSec * 1000;

      $interval(() => {
        const lightWallet = require('core/light_wallet.js');

        lightWallet.refreshLightClientHistory();
      }, refreshRate);
    }

    return {
      initHistoryAutoRefresh
    };
  }
}());

