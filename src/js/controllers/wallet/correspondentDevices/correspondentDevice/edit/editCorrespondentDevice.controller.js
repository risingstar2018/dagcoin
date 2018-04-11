(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('EditCorrespondentDeviceCtrl', EditCorrespondentDeviceCtrl);

  EditCorrespondentDeviceCtrl.$inject = ['profileService', 'go', 'correspondentListService', '$modal',
    'animationService', 'gettextCatalog'];

  function EditCorrespondentDeviceCtrl(profileService, go, correspondentListService, $modal, animationService, gettextCatalog) {
    const vm = this;
    const correspondent = correspondentListService.currentCorrespondent;
    vm.correspondent = correspondent;
    vm.name = vm.correspondent.name;
    vm.hub = vm.correspondent.hub;

    vm.save = function () {
      vm.error = null;
      correspondent.name = vm.name;
      correspondent.hub = vm.hub;
      const device = require('core/device.js');
      device.updateCorrespondentProps(correspondent, () => {
        go.path('correspondentDevice');
      });
    };

    vm.purgeChat = function () {
      const ModalInstanceCtrl = function ($scopeModal, $modalInstance, $sce) {
        $scopeModal.header = $sce.trustAsHtml(gettextCatalog.getString('Clear chat history'));
        $scopeModal.title = $sce.trustAsHtml(gettextCatalog.getString(`Delete the whole chat history with ${correspondent.name} ?`));

        $scopeModal.ok = function () {
          $modalInstance.close(true);
          go.path('correspondentDevice');
        };
        $scopeModal.cancel = function () {
          $modalInstance.dismiss('cancel');
          go.path('editCorrespondentDevice');
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
          const chatStorage = require('core/chat_storage.js');
          chatStorage.purge(correspondent.device_address);
          correspondentListService.messageEventsByCorrespondent[correspondent.device_address] = [];
        }
      });
    };
  }
})();
