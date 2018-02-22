(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('PreferencesCtrl', PreferencesCtrl);

  PreferencesCtrl.$inject = ['$scope', '$rootScope', '$log', 'configService', 'profileService', 'uxLanguage'];

  function PreferencesCtrl($scope, $rootScope, $log, configService, profileService, uxLanguage) {
    const vm = this;
    vm.init = function () {
      const config = configService.getSync();
      vm.unitName = config.wallet.settings.unitName;
      vm.currentLanguageName = uxLanguage.getCurrentLanguageName();
      vm.spendUnconfirmed = config.wallet.spendUnconfirmed;
      const fc = profileService.focusedClient;
      if (fc) {
        vm.externalSource = null;
        const walletDefinedByKeys = require('byteballcore/wallet_defined_by_keys.js');
        walletDefinedByKeys.readAddresses(fc.credentials.walletId, {}, (addresses) => {
          vm.numAddresses = addresses.length;
          $rootScope.$apply();
        });
        vm.numCosigners = fc.credentials.n;
      }
    };

    const unwatchSpendUnconfirmed = $scope.$watch('spendUnconfirmed', (newVal, oldVal) => {
      if (newVal === oldVal) {
        return;
      }
      const opts = {
        wallet: {
          spendUnconfirmed: newVal
        }
      };
      configService.set(opts, (err) => {
        $rootScope.$emit('Local/SpendUnconfirmedUpdated');
        if (err) {
          $log.debug(err);
        }
      });
    });

    $scope.$on('$destroy', () => {
      unwatchSpendUnconfirmed();
    });

    $scope.$watch('index.isSingleAddress', (newValue, oldValue) => {
      if (oldValue === newValue) { return; }
      profileService.setSingleAddressFlag(newValue);
    });

    vm.init();
  }
})();
