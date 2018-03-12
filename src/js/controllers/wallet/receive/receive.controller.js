/* eslint-disable no-shadow */
(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('ReceiveCtrl', ReceiveCtrl);

  ReceiveCtrl.$inject = ['$scope', '$rootScope', '$location', '$anchorScroll', '$timeout', '$log', 'lodash', 'go', 'profileService',
    'configService', 'gettextCatalog', 'derivationPathHelper', 'correspondentListService', 'utilityService',
    'nodeWebkit', '$modal', 'animationService', 'addressService', 'ENV'];

  function ReceiveCtrl($scope, $rootScope, $location, $anchorScroll, $timeout, $log, lodash, go, profileService,
                       configService, gettextCatalog, derivationPathHelper, correspondentListService, utilityService,
                       nodeWebkit, $modal, animationService, addressService, ENV) {
    const isCordova = utilityService.isCordova;
    const breadcrumbs = require('byteballcore/breadcrumbs.js');
    const config = configService.getSync();
    const configWallet = config.wallet;
    const vm = this;

    // INIT
    const walletSettings = configWallet.settings;
    vm.unitValue = walletSettings.unitValue;
    vm.unitName = walletSettings.unitName;
    vm.unitDecimals = walletSettings.unitDecimals;
    vm.protocol = ENV.protocolPrefix;

    // TODO indexScope is called just for getting available amount. This should not be done like that.
    const indexScope = $scope.index;

    const viewContentLoaded = function () {
      console.log('receive controller content loaded');
      vm.addr = {};
      vm.setAddress();
    };

    const destroy = function () {
      console.log('receive controller $destroy');
    };

    vm.copyAddress = function (address) {
      utilityService.copyAddress($scope, address);
    };

    vm.openCustomizedAmountModal = function (addr) {
      $rootScope.modalOpened = true;
      const fc = profileService.focusedClient;
      const ModalInstanceCtrl = function ($scope, $modalInstance) {
        const conf = require('byteballcore/conf.js');
        $scope.addr = addr;
        $scope.color = fc.backgroundColor;
        $scope.unitName = vm.unitName;
        $scope.unitValue = vm.unitValue;
        $scope.unitDecimals = vm.unitDecimals;
        $scope.isCordova = isCordova;
        $scope.buttonLabel = gettextCatalog.getString('Generate QR Code');
        $scope.protocol = conf.program;

        Object.defineProperty($scope, '_customAmount', {
          get() {
            return $scope.customAmount;
          },
          set(newValue) {
            $scope.customAmount = newValue;
          },
          enumerable: true,
          configurable: true,
        });

        $scope.submitForm = function (form) {
          if ($scope.index.arrBalances.length === 0) {
            return console.log('openCustomizedAmountModal: no balances yet');
          }
          const amount = form.amount.$modelValue;
          const amountInSmallestUnits = parseInt((amount * $scope.unitValue).toFixed(0), 10);

          return $timeout(() => {
            $scope.customizedAmountUnit = `${amount} ${$scope.unitName}`;
            $scope.amountInSmallestUnits = amountInSmallestUnits;
            $scope.asset_param = '';
          }, 1);
        };

        $scope.shareAddress = function (uri) {
          window.plugins.socialsharing.share(uri, null, null, null);
        };

        $scope.cancel = function () {
          breadcrumbs.add('openCustomizedAmountModal: cancel');
          $modalInstance.dismiss('cancel');
        };
      };

      const modalInstance = $modal.open({
        templateUrl: 'views/modals/customized-amount.html',
        windowClass: animationService.modalAnimated.slideUp,
        controller: ModalInstanceCtrl,
        scope: $scope
      });

      const disableCloseModal = $rootScope.$on('closeModal', () => {
        breadcrumbs.add('openCustomizedAmountModal: on closeModal');
        modalInstance.dismiss('cancel');
      });

      modalInstance.result.finally(() => {
        $rootScope.modalOpened = false;
        disableCloseModal();
        const m = angular.element(document.getElementsByClassName('reveal-modal'));
        m.addClass(animationService.modalAnimated.slideOutDown);
      });
    };

    vm.setAddress = function (forceNew) {
      vm.addrError = null;
      const fc = profileService.focusedClient;
      if (!fc) {
        return;
      }

      // Address already set?
      if (!forceNew && vm.addr[fc.credentials.walletId]) {
        return;
      }

      if (indexScope.shared_address && forceNew) {
        throw Error('attempt to generate for shared address');
      }

      if (fc.isSingleAddress && forceNew) {
        throw Error('attempt to generate for single address wallets');
      }

      vm.generatingAddress = true;
      $timeout(() => {
        addressService.getAddress(fc.credentials.walletId, forceNew, (err, addr) => {
          vm.generatingAddress = false;

          if (err) {
            vm.addrError = err;
          } else if (addr) {
            vm.addr[fc.credentials.walletId] = addr;
          }

          $timeout(() => {
            $scope.$digest();
          });
        });
      });
    };

    $scope.$on('$viewContentLoaded', viewContentLoaded);
    $scope.$on('$destroy', destroy);
  }
})();
