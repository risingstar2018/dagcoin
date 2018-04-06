/* eslint-disable no-shadow */
(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('ReceiveCtrl', ReceiveCtrl);

  ReceiveCtrl.$inject = ['$scope', '$rootScope', '$timeout', 'profileService', 'configService', 'gettextCatalog', 'utilityService',
                        '$modal', 'animationService', 'addressService', 'ENV'];

  function ReceiveCtrl($scope, $rootScope, $timeout, profileService, configService, gettextCatalog, utilityService,
                       $modal, animationService, addressService, ENV) {
    const eventBus = require('byteballcore/event_bus.js');
    const isCordova = utilityService.isCordova;
    const breadcrumbs = require('byteballcore/breadcrumbs.js');
    const config = configService.getSync();
    const vm = this;

    const indexScope = $scope.index;

    const viewContentLoaded = function () {
      const conf = require('byteballcore/conf.js');
      vm.addr = {};
      vm.setAddress();
      vm.isCordova = isCordova;
      vm.protocol = conf.program;
    };

    function onNewWalletAddress(newAddress) {
      console.log(`==== NEW ADDRESSS ${newAddress}`);
      vm.addr = {};
      vm.setAddress();
    }

    eventBus.on('new_wallet_address', onNewWalletAddress);

    const destroy = function () {
      console.log('receive controller $destroy');
      eventBus.removeListener('new_wallet_address', onNewWalletAddress);
    };

    vm.copyAddress = function (address) {
      utilityService.copyAddress($scope, address);
    };

    vm.openCustomizedAmountModal = function (addr) {
      $rootScope.modalOpened = true;
      const fc = profileService.focusedClient;
      const ModalInstanceCtrl = function ($scope, $modalInstance) {
        const conf = require('byteballcore/conf.js');
        const configWallet = config.wallet;
        const walletSettings = configWallet.settings;
        $scope.addr = addr;
        $scope.color = fc.backgroundColor;
        $scope.unitName = walletSettings.unitName;
        $scope.unitValue = walletSettings.unitValue;
        $scope.unitDecimals = walletSettings.unitDecimals;
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
          const options = {
            message: `Payment request: ${amount} DAG to ${address}`, // not supported on some apps (Facebook, Instagram)
            subject: 'Payment Request', // fi. for email
            url: `https://${ENV.universalLinkHost}/paymentRequest?address=${address}&amount=${amount}`,
            chooserTitle: 'Pick an application' // Android only, you can override the default share sheet title
          };
          window.plugins.socialsharing.shareWithOptions(options);
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
