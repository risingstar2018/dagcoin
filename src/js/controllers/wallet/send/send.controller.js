(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('SendCtrl', SendCtrl);

  SendCtrl.$inject = ['$scope', '$rootScope', '$location', '$anchorScroll', '$timeout', '$log', 'lodash', 'go', 'profileService',
    'configService', 'gettextCatalog', 'derivationPathHelper', 'correspondentListService', 'utilityService',
    'ENV'];

  function SendCtrl($scope, $rootScope, $location, $anchorScroll, $timeout, $log, lodash, go, profileService,
                    configService, gettextCatalog, derivationPathHelper, correspondentListService, utilityService, ENV) {
    // TODO indexScope is called just for getting available amount. This should not be done like that.
    const indexScope = $scope.index;
    const config = configService.getSync();
    const configWallet = config.wallet;
    const vm = this;

    // INIT
    const walletSettings = configWallet.settings;
    vm.unitValue = walletSettings.unitValue;
    vm.unitName = walletSettings.unitName;
    vm.unitDecimals = walletSettings.unitDecimals;

    $scope.currentSpendUnconfirmed = configWallet.spendUnconfirmed;

    const viewContentLoaded = function () {
      $scope.sendForm.$setPristine();
      vm.resetForm(() => {
        if ($rootScope.sendParams) {
          if ($rootScope.sendParams.amount) {
            $scope._amount = $rootScope.sendParams.amount;
          }
          if ($rootScope.sendParams.address) {
            $scope._address = $rootScope.sendParams.address;
          }
          delete $rootScope.sendParams;
        }
      });
      if (profileService.focusedClient) {
        vm.setSendFormInputs();
      }
    };

    vm.resetError = function () {
      vm.error = null;
      vm.success = null;
    };

    vm.onAddressChange = function (value) {
      vm.resetError();
      return !value ? '' : value;
    };

    vm.setSendFormInputs = function () {
      /**
       * Setting the two related amounts as properties prevents an infinite
       * recursion for watches while preserving the original angular updates
       *
       */
      Object.defineProperty($scope,
        '_amount', {
          get() {
            return $scope.__amount;
          },
          set(newValue) {
            $scope.__amount = newValue;
            vm.resetError();
          },
          enumerable: true,
          configurable: true
        });

      Object.defineProperty($scope,
        '_address', {
          get() {
            return $scope.__address;
          },
          set(newValue) {
            $scope.__address = vm.onAddressChange(newValue);
            if ($scope.sendForm && $scope.sendForm.address.$valid) {
              vm.lockAddress = true;
            }
          },
          enumerable: true,
          configurable: true,
        });

      // ToDo: use a credential's (or fc's) function for this
      vm.hideNote = true;
    };

    vm.resetForm = function (cb) {
      vm.resetError();
      delete vm.binding;

      const invoiceId = vm.invoiceId;

      const options = {
        uri: `${ENV.MERCHANT_INTEGRATION_API}/cancel`,
        method: 'POST',
        json: {
          invoiceId
        }
      };

      if (invoiceId !== null) {
        const request = require('request');
        request(options, (error, response, body) => {
          if (error) {
            console.log(`CANCEL ERROR: ${error}`);
          }
          console.log(`RESPONSE: ${JSON.stringify(response)}`);
          console.log(`BODY: ${JSON.stringify(body)}`);
        });
      }

      vm.invoiceId = null;
      vm.validForSeconds = null;
      vm.lockAsset = false;
      vm.lockAddress = false;
      vm.lockAmount = false;
      vm.hideAdvSend = true;
      $scope.currentSpendUnconfirmed = configService.getSync().wallet.spendUnconfirmed;

      vm._amount = null;
      vm._address = null;
      vm.bSendAll = false;

      const form = $scope.sendForm;

      if (form && form.amount) {
        form.amount.$pristine = true;
        form.amount.$setViewValue('');
        if (form.amount) {
          form.amount.$render();
        }

        if (form.merkle_proof) {
          form.merkle_proof.$setViewValue('');
          form.merkle_proof.$render();
        }
        if (form.comment) {
          form.comment.$setViewValue('');
          form.comment.$render();
        }
        form.$setPristine();

        if (form.address) {
          form.address.$pristine = true;
          form.address.$setViewValue('');
          form.address.$render();
        }
      }
      $timeout(() => {
        if (cb) {
          cb();
        }
        $rootScope.$digest();
      }, 1);
    };

    vm.setSendAll = () => {
      const form = $scope.sendForm;
      if (!form || !form.amount || indexScope.arrBalances.length === 0) {
        return;
      }
      let available = indexScope.baseBalance.stable;
      available /= vm.unitValue;
      form.amount.$setViewValue(`${available}`);
      form.amount.$render();
    };

    $scope.$on('$viewContentLoaded', viewContentLoaded);
  }
})();
