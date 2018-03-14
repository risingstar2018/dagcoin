/* eslint-disable no-unused-vars,no-shadow */
(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('HomeCtrl', HomeCtrl);

  HomeCtrl.$inject = ['$scope', '$rootScope', 'animationService', '$timeout', 'profileService', 'correspondentListService', '$modal', 'lodash'];

  function HomeCtrl($scope, $rootScope, animationService, $timeout,profileService, correspondentListService, $modal, lodash) {
    const vm = this;
    const breadcrumbs = require('byteballcore/breadcrumbs.js');

    vm.openSharedAddressDefinitionModal = function (address) {
      $rootScope.modalOpened = true;
      // todo: refactor me
      const indexScope = $scope.index;
      const fc = profileService.focusedClient;

      const ModalInstanceCtrl = function ($scope, $modalInstance) {
        $scope.color = fc.backgroundColor;
        $scope.address = address;

        const walletGeneral = require('byteballcore/wallet_general.js');
        const walletDefinedByAddresses = require('byteballcore/wallet_defined_by_addresses.js');
        walletGeneral.readMyAddresses((arrMyAddresses) => {
          walletDefinedByAddresses.readSharedAddressDefinition(address, (arrDefinition, creationTs) => {
            $scope.humanReadableDefinition = correspondentListService.getHumanReadableDefinition(arrDefinition, arrMyAddresses, [], true);
            $scope.creation_ts = creationTs;
            walletDefinedByAddresses.readSharedAddressCosigners(address, (cosigners) => {
              $scope.cosigners = cosigners.map(cosigner => cosigner.name).join(', ');
              $scope.$apply();
            });
          });
        });

        // clicked a link in the definition
        $scope.sendPayment = function (receiverAddress, amount) {
          $modalInstance.dismiss('done');
          return $timeout(() => {
            indexScope.shared_address = null;
            indexScope.updateAll();
            indexScope.updateTxHistory();
            $rootScope.$emit('paymentRequest', receiverAddress, amount, 'base');
          });
        };

        $scope.cancel = function () {
          breadcrumbs.add('openSharedAddressDefinitionModal cancel');
          $modalInstance.dismiss('cancel');
        };
      };

      const modalInstance = $modal.open({
        templateUrl: 'views/modals/address-definition.html',
        windowClass: animationService.modalAnimated.slideUp,
        controller: ModalInstanceCtrl,
      });

      const disableCloseModal = $rootScope.$on('closeModal', () => {
        breadcrumbs.add('openSharedAddressDefinitionModal on closeModal');
        modalInstance.dismiss('cancel');
      });

      modalInstance.result.finally(() => {
        $rootScope.modalOpened = false;
        disableCloseModal();
        const m = angular.element(document.getElementsByClassName('reveal-modal'));
        m.addClass(animationService.modalAnimated.slideOutDown);
      });
    };

    vm.openSubwalletModal = function () {
      $rootScope.modalOpened = true;
      const fc = profileService.focusedClient;

      const ModalInstanceCtrl = function ($scope, $modalInstance) {
        $scope.color = fc.backgroundColor;
        $scope.indexCtl = $scope.index;
        const arrSharedWallets = [];
        $scope.mainWalletBalanceInfo = lodash.find(self.arrMainWalletBalances, { asset: 'base' });
        $scope.asset = 'base';
        const assocSharedByAddress = $scope.mainWalletBalanceInfo.assocSharedByAddress;

        if (assocSharedByAddress) {
          Object.keys(assocSharedByAddress).forEach((sa) => {
            const objSharedWallet = {};
            objSharedWallet.shared_address = sa;
            objSharedWallet.total = assocSharedByAddress[sa];
            objSharedWallet.totalStr = `${profileService.formatAmount(assocSharedByAddress[sa], 'dag')}`;

            arrSharedWallets.push(objSharedWallet);
          });
          $scope.arrSharedWallets = arrSharedWallets;
        }

        $scope.cancel = function () {
          breadcrumbs.add('openSubwalletModal cancel');
          $modalInstance.dismiss('cancel');
        };

        $scope.selectSubwallet = function (sharedAddress) {
          $scope.indexCtl.shared_address = sharedAddress;
          if (sharedAddress) {
            const walletDefinedByAddresses = require('byteballcore/wallet_defined_by_addresses.js');
            walletDefinedByAddresses.determineIfHasMerkle(sharedAddress, (bHasMerkle) => {
              $scope.indexCtl.bHasMerkle = bHasMerkle;
              $rootScope.$apply();
            });
          } else {
            $scope.indexCtl.bHasMerkle = false;
          }
          $scope.indexCtl.updateAll();
          $scope.indexCtl.updateTxHistory();
          $modalInstance.close();
        };
      };

      const modalInstance = $modal.open({
        templateUrl: 'views/modals/select-subwallet.html',
        windowClass: animationService.modalAnimated.slideUp,
        controller: ModalInstanceCtrl
      });

      const disableCloseModal = $rootScope.$on('closeModal', () => {
        breadcrumbs.add('openSubwalletModal on closeModal');
        modalInstance.dismiss('cancel');
      });

      modalInstance.result.finally(() => {
        $rootScope.modalOpened = false;
        disableCloseModal();
        const m = angular.element(document.getElementsByClassName('reveal-modal'));
        m.addClass(animationService.modalAnimated.slideOutDown);
      });
    };

    vm.getFontSizeForWalletNumber = (value, type) => {
      if (value) {
        const visibleWidth = window.innerWidth - 50;
        const str = value.toString().split('.');

        const length = str[0].length + ((str[1] || 0).length / 2);
        const size = ((visibleWidth / length) < 70 ? ((visibleWidth / length) + 10) : 80);

        return { 'font-size': `${(!type ? size : size / 2)}px` };
      }
      return { 'font-size': '80px' };
    };

    // for light clients only
    vm.updateHistoryFromNetwork = lodash.throttle(() => {
      setTimeout(() => {
        if (self.assetIndex !== self.oldAssetIndex) {
          // it was a swipe
          console.log('== swipe');
          return;
        }
        console.log('== updateHistoryFromNetwork');
        const lightWallet = require('byteballcore/light_wallet.js');
        lightWallet.refreshLightClientHistory();
      }, 500);
    }, 5000);

    // TODO sinan home methods will be written into this class
  }
})();
