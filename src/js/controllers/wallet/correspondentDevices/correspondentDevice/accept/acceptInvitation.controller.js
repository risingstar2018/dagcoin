(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('AcceptCorrespondentInvitationCtrl', AcceptCorrespondentInvitationCtrl);

  AcceptCorrespondentInvitationCtrl.$inject = ['$rootScope', '$timeout', 'profileService', 'Device',
                                                      'correspondentListService', 'gettextCatalog', '$log'];

  function AcceptCorrespondentInvitationCtrl($rootScope, $timeout, profileService, Device, correspondentListService,
                                                   gettextCatalog, $log) {
    const vm = this;
    const fc = profileService.focusedClient;
    vm.backgroundColor = fc.backgroundColor;

    vm.beforeQrCodeScan = function () {
      setError(null);
    };

    vm.onQrCodeScanned = function (data) {
      $log.debug(`onQrCodeScanned: ${data}`);
      handleCode(data);
    };

    vm.pair = function () {
      setError(null);
      handleCode(vm.code);
    };

    vm.setOngoingProcess = function (name) {
      if (Device.cordova) {
        if (name) {
          window.plugins.spinnerDialog.hide();
          window.plugins.spinnerDialog.show(null, `${name}...`, true);
        } else {
          window.plugins.spinnerDialog.hide();
        }
      } else {
        vm.onGoingProcess = name;
        $timeout(() => {
          $rootScope.$apply();
        });
      }
    };

    function handleCode(code) {
      const matches = code.match(/^([\w\/+]+)@([\w.:\/-]+)#([\w\/+-]+)$/);
      if (!matches) {
        return setError(gettextCatalog.getString('Invalid pairing code'));
      }
      const pubkey = matches[1];
      const hub = matches[2];
      const pairingSecret = matches[3];
      if (pubkey.length !== 44) {
        return setError(gettextCatalog.getString('Invalid pubkey length'));
      }
      $log.debug(pubkey, hub, pairingSecret);
      vm.setOngoingProcess(gettextCatalog.getString('pairing'));
      correspondentListService.acceptInvitation(hub, pubkey, pairingSecret, (err) => {
        if (err) {
          $log.error('acceptInvitationError', err);
        }
        vm.setOngoingProcess();
      });
    }

    function setError(error) {
      vm.error = error;
    }
  }
})();
