/* eslint-disable no-shadow */
(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('CopayersCtrl', CopayersCtrl);

  CopayersCtrl.$inject = ['$scope', '$timeout', '$log', '$modal', 'profileService', 'go', 'notification', 'Device',
                          'gettextCatalog', 'animationService'];

  function CopayersCtrl($scope, $timeout, $log, $modal, profileService, go, notification, Device, gettextCatalog, animationService) {
    const self = this;
    const isCordova = Device.cordova;
    const deleteMessage = gettextCatalog.getString('Are you sure you want to delete this wallet?');
    const acceptMessage = gettextCatalog.getString('Accept');
    const cancelMessage = gettextCatalog.getString('Cancel');
    const confirmMessage = gettextCatalog.getString('Confirm');

    self.init = function () {
      const fc = profileService.focusedClient;
      if (fc.isComplete()) {
        $log.debug('Wallet Complete...redirecting');
        go.walletHome();
        return;
      }
      self.loading = false;
      self.isCordova = isCordova;
    };

    const deleteWallet = function () {
      $timeout(() => {
        const fc = profileService.focusedClient;
        const walletName = fc.credentials.walletName;

        profileService.deleteWallet({}, (err) => {
          if (err) {
            self.error = err.message || err;
            $log.error(err);
            $timeout(() => {
              $scope.$digest();
            });
            return;
          }
          go.walletHome();
          $timeout(() => {
            notification.success(gettextCatalog.getString('Success'), gettextCatalog.getString('The wallet "{{walletName}}" was deleted', { walletName }));
          });
        });
      }, 100);
    };

    const modalDeleteWallet = function () {
      const ModalInstanceCtrl = function ($scope, $modalInstance, $sce) {
        $scope.header = $sce.trustAsHtml(gettextCatalog.getString('Delete wallet'));
        $scope.title = $sce.trustAsHtml(deleteMessage);
        $scope.yes_icon = 'fi-trash';
        $scope.yes_button_class = 'warning';
        $scope.cancel_button_class = 'light-gray outline';
        $scope.loading = false;

        $scope.ok = function () {
          $scope.loading = true;
          $modalInstance.close(acceptMessage);
        };
        $scope.cancel = function () {
          $modalInstance.dismiss(cancelMessage);
        };
      };

      const modalInstance = $modal.open({
        templateUrl: 'views/modals/confirmation.html',
        windowClass: animationService.modalAnimated.slideUp,
        controller: ModalInstanceCtrl
      });

      modalInstance.result.finally(() => {
        const m = angular.element(document.getElementsByClassName('reveal-modal'));
        m.addClass(animationService.modalAnimated.slideOutDown);
      });

      modalInstance.result.then((ok) => {
        if (ok) {
          deleteWallet();
        }
      });
    };

    self.deleteWallet = function () {
      if (!isCordova) {
        modalDeleteWallet();
        return;
      }
      navigator.notification.confirm(
        deleteMessage,
        (buttonIndex) => {
          if (buttonIndex === 1) {
            deleteWallet();
          }
        },
        confirmMessage, [acceptMessage, cancelMessage]);
    };

    self.init();
  }
})();
