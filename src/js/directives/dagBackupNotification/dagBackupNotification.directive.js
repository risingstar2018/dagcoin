(() => {
  'use strict';

  /**
   * @name DagCoin Navigation Bar
   * @desc Navigation bar located at the top of each page
   * @example <dag-nav-bar title="Language" invert goBack="preferencesSystem"></dag-nav-bar>
   */
  angular
  .module('copayApp.directives')
  .directive('dagBackupNotification', dagBackupNotification);

  dagBackupNotification.$inject = ['$state', 'gettextCatalog', '$modal', 'animationService', 'navigationService'];

  function dagBackupNotification($state, gettextCatalog, $modal, animationService, navigationService) {
    return {
      restrict: 'E',
      templateUrl: 'directives/dagBackupNotification/dagBackupNotification.template.html',
      transclude: true,
      replace: true,
      scope: {},
      link: ($scope) => {
        $scope.openBackupNeededModal = function () {
          const ModalInstanceCtrl = function ($scopeModal, $modalInstance, $sce) {
            $scopeModal.header = $sce.trustAsHtml(gettextCatalog.getString('Backup needed'));
            $scopeModal.title = $sce.trustAsHtml(gettextCatalog.getString(`Now is a good time to backup your wallet seed.
          Write it down and keep it somewhere safe. Once you have written your wallet seed down, you must delete it from
          this device. If this device is lost, it will be impossible to access your funds without a backup.`));

            $scopeModal.yes_label = gettextCatalog.getString('Backup now');
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
              navigationService.navigateSecure('backup');
            }
          });
        };
      }
    };
  }
})();
