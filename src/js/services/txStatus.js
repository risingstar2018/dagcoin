(function () {
  'use strict';

  angular.module('copayApp.services').factory('txStatus', ($modal, lodash, profileService, $timeout, animationService) => {
    const root = {};

    const openModal = function (type, txp, cb) {
      const ModalInstanceCtrl = function ($scope, $modalInstance) {
        $scope.type = type;
        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
        if (cb) $timeout(cb, 100);
      };
      const modalInstance = $modal.open({
        templateUrl: root.templateUrl(type, txp),
        windowClass: `popup-tx-status ${animationService.modalAnimated.slideUp}`,
        controller: ModalInstanceCtrl,
      });

      modalInstance.result.finally(() => {
        const m = angular.element(document.getElementsByClassName('reveal-modal'));
        m.addClass('hideModal');
      });
    };

    root.notify = function (txp, cb) {
      // const fc = profileService.focusedClient;
      const status = txp.status;
      let type;
      // const INMEDIATE_SECS = 10;

      if (status === 'broadcasted') {
        type = 'broadcasted';
      } else {
        throw Error('unsupported status');
      }

      openModal(type, txp, cb);
    };

    root.templateUrl = function () {
      return 'views/modals/tx-status.html';
    };


    return root;
  });
}());
