(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('InviteCorrespondentDeviceCtrl', InviteCorrespondentDeviceCtrl);

  InviteCorrespondentDeviceCtrl.$inject = ['$scope', '$timeout', 'profileService', 'go', 'Device', 'correspondentListService',
                                          'gettextCatalog', 'nodeWebkit', '$log'];

  function InviteCorrespondentDeviceCtrl($scope, $timeout, profileService, go, Device, correspondentListService,
                                         gettextCatalog, nodeWebkit, $log) {
    const eventBus = require('core/event_bus.js');
    const conf = require('core/conf.js');
    const vm = this;
    const fc = profileService.focusedClient;
    vm.protocol = conf.program;
    vm.isCordova = Device.cordova;
    vm.color = fc.backgroundColor;
    vm.error = null;
    vm.cancelAddCorrespondent = () => go.path('wallet.correspondentDevices');
    vm.onTextClick = $event => $event.target.select();

    vm.copyCode = function () {
      if (vm.isCordova) {
        window.cordova.plugins.clipboard.copy(vm.code);
        window.plugins.toast.showShortCenter(gettextCatalog.getString('Copied to clipboard'));
        showTooltipCopied();
      } else if (nodeWebkit.isDefined()) {
        nodeWebkit.writeToClipboard(vm.code);
        showTooltipCopied();
      } else {
        $log.warn('env is neither cordova nor nodeWebkit. code could not be copied.');
      }
    };

    correspondentListService.startWaitingForPairing((pairingInfo) => {
      $log.debug(`beginAddCorrespondent ${pairingInfo.pairing_secret}`);
      vm.code = `${pairingInfo.device_pubkey}@${pairingInfo.hub}#${pairingInfo.pairing_secret}`;
      $scope.$digest();
      const eventName = `paired_by_secret-${pairingInfo.pairing_secret}`;
      eventBus.once(eventName, onPaired);
      $scope.$on('$destroy', () => {
        eventBus.removeListener(eventName, onPaired);
      });
    });

    function showTooltipCopied() {
      vm.tooltipCopiedShown = true;

      $timeout(() => {
        vm.tooltipCopiedShown = false;
      }, 1000);
    }

    function onPaired(peerAddress) {
      correspondentListService.setCurrentCorrespondent(peerAddress, () => {
        go.path('correspondentDevice');
      });
    }
  }
})();
