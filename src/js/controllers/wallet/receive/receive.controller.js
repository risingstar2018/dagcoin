(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('ReceiveCtrl', ReceiveCtrl);

  ReceiveCtrl.$inject = ['$scope', '$rootScope', '$location', '$anchorScroll', '$timeout', '$log', 'lodash', 'go', 'profileService',
    'configService', 'gettextCatalog', 'derivationPathHelper', 'correspondentListService', 'utilityService',
    'nodeWebkit', '$modal', 'animationService'];

  function ReceiveCtrl($scope, $rootScope, $location, $anchorScroll, $timeout, $log, lodash, go, profileService,
                       configService, gettextCatalog, derivationPathHelper, correspondentListService, utilityService,
                       nodeWebkit, $modal, animationService) {
    const isCordova = utilityService.isCordova;
    const breadcrumbs = require('byteballcore/breadcrumbs.js');
    const conf = require('byteballcore/conf.js');
    const vm = this;

    vm.copyAddress = function (address) {
      utilityService.copyAddress($scope, address);
    };

    vm.openCustomizedAmountModal = function (addr) {
      $rootScope.modalOpened = true;
      const self = this;
      const fc = profileService.focusedClient;
      const ModalInstanceCtrl = function ($scope, $modalInstance) {
        $scope.addr = addr;
        $scope.color = fc.backgroundColor;
        $scope.unitName = self.unitName;
        $scope.unitValue = self.unitValue;
        $scope.unitDecimals = self.unitDecimals;
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
          debugger;
          if ($scope.index.arrBalances.length === 0) {
            return console.log('openCustomizedAmountModal: no balances yet');
          }
          const amount = form.amount.$modelValue;
          const amountInSmallestUnits = parseInt((amount * $scope.unitValue).toFixed(0));

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

  }
})();
