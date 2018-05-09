(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('PreferencesDeleteWalletCtrl', PreferencesDeleteWalletCtrl);

  PreferencesDeleteWalletCtrl.$inject = ['$rootScope', '$modal', 'notification', 'profileService', 'Device', 'gettextCatalog', 'animationService', 'sharedService'];

  function PreferencesDeleteWalletCtrl($rootScope, $modal, notification, profileService, Device, gettextCatalog, animationService, sharedService) {
    const vm = this;
    const balanceMessage = gettextCatalog.getString('This Wallet has positive balance.');
    const hasBalance = sharedService.hasBalance(sharedService.balanceStatuses.total);
    let deleteMessage = gettextCatalog.getString('Are you sure you want to delete this wallet?');
    const acceptMessage = gettextCatalog.getString('Accept');
    const cancelMessage = gettextCatalog.getString('Cancel');
    const confirmMessage = gettextCatalog.getString('Confirm');
    vm.error = null;

    if (hasBalance) {
      deleteMessage = `${balanceMessage}\n${deleteMessage}`;
    }

    vm.deleteWallet = () => {
      if (profileService.profile.credentials.length === 1 || profileService.getWallets().length === 1) {
        return $rootScope.$emit('Local/ShowErrorAlert', gettextCatalog.getString("Can't delete the last remaining wallet"));
      }
      if (Device.cordova) {
        return navigator.notification.confirm(
          deleteMessage,
          (buttonIndex) => {
            if (buttonIndex === 1) {
              remove();
            }
          },
          confirmMessage, [acceptMessage, cancelMessage]);
      }
      return modalDeleteWallet();
    };

    function modalDeleteWallet() {
      const ModalInstanceCtrl = function ($scope, $modalInstance, $sce) {
        $scope.header = $sce.trustAsHtml(gettextCatalog.getString('Delete wallet'));
        $scope.title = $sce.trustAsHtml(deleteMessage);
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
          remove();
        }
      });
    }

    function remove() {
      const fc = profileService.focusedClient;
      const name = fc.credentials.walletName;
      const walletName = `${fc.alias || ''} [${name}]`;
      const self = this;

      profileService.deleteWallet({}, (err) => {
        if (err) {
          self.error = err.message || err;
        } else {
          notification.success(gettextCatalog.getString('Success'), gettextCatalog.getString('The wallet "{{walletName}}" was deleted', {
            walletName
          }));
        }
      });
    }
  }
})();
