(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('PreferencesSystemCtrl', PreferencesSystemCtrl);

  PreferencesSystemCtrl.$inject = ['$scope', '$modal', 'configService', 'uxLanguage', 'animationService', 'changeWalletTypeService', 'gettextCatalog'];

  function PreferencesSystemCtrl($scope, $modal, configService, uxLanguage, animationService, changeWalletTypeService, gettextCatalog) {
    const conf = require('core/conf.js');
    const config = configService.getSync();
    const vm = this;
    vm.isLight = conf.bLight;
    vm.canChangeWalletType = changeWalletTypeService.canChange();
    vm.canChangeHubSettings = true;
    vm.type = conf.bLight ? gettextCatalog.getString('light wallet') : gettextCatalog.getString('full wallet');
    vm.currentLanguageName = uxLanguage.getCurrentLanguageName();
    vm.deviceName = config.deviceName;
    vm.hub = config.hub;

    vm.changeWalletType = function () {
      if (vm.isLight) {
        const ModalInstanceCtrl = function ($scopeModal, $modalInstance, $sce) {
          $scopeModal.header = $sce.trustAsHtml(gettextCatalog.getString('Change wallet type!'));
          $scopeModal.title = $sce.trustAsHtml(gettextCatalog.getString(`The wallet will contain the most current state of the entire Dagcoin database. 
            This option is better for privacy but will take several gigabytes of storage and the initial sync will take several days. 
            CPU load will be high during sync. After changing to full wallet your money won't be visible until database will synchronize your transactions.`));

          $scopeModal.yes_label = gettextCatalog.getString('Change it');
          $scopeModal.ok = function () {
            $modalInstance.close(true);
          };
          $scopeModal.cancel = function () {
            $modalInstance.dismiss('cancel');
          };
        };

        const modalInstance = $modal.open({
          templateUrl: 'views/modals/confirmation.html',
          windowClass: animationService.modalAnimated.slideUp,
          controller: ['$scope', '$modalInstance', '$sce', ModalInstanceCtrl],
        });

        modalInstance.result.finally(() => {
          const m = angular.element(document.getElementsByClassName('reveal-modal'));
          m.addClass(animationService.modalAnimated.slideOutDown);
        });

        modalInstance.result.then((ok) => {
          if (ok) {
            changeWalletTypeService.change();
          }
        });
      } else {
        changeWalletTypeService.change();
      }
    };

    vm.changeHubSettings = () => {

    };
  }
})();
