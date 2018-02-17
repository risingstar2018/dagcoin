(function () {
  'use strict';

  angular.module('dagcoin.controllers').controller('preferencesController',
    function ($scope, $rootScope, $filter, $timeout, $modal, $log, lodash, configService, profileService, fingerprintService, uxLanguage) {
      this.init = function () {
        const config = configService.getSync();
        this.unitName = config.wallet.settings.unitName;
        this.currentLanguageName = uxLanguage.getCurrentLanguageName();
        $scope.spendUnconfirmed = config.wallet.spendUnconfirmed;
        const fc = profileService.focusedClient;
        if (fc) {
          // $scope.encrypt = fc.hasPrivKeyEncrypted();
          this.externalSource = null;
          const walletDefinedByKeys = require('byteballcore/wallet_defined_by_keys.js');
          walletDefinedByKeys.readAddresses(fc.credentials.walletId, {}, (addresses) => {
            $scope.numAddresses = addresses.length;
            $rootScope.$apply();
          });
          $scope.numCosigners = fc.credentials.n;
          // TODO externalAccount
          // this.externalIndex = fc.getExternalIndex();
        }
      };

      const unwatchSpendUnconfirmed = $scope.$watch('spendUnconfirmed', (newVal, oldVal) => {
        if (newVal === oldVal) {
          return;
        }
        const opts = {
          wallet: {
            spendUnconfirmed: newVal,
          },
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
    });
}());
