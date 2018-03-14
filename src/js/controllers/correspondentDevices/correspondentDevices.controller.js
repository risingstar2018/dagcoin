(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('CorrespondentDevicesCtrl', CorrespondentDevicesCtrl);

  CorrespondentDevicesCtrl.$inject = ['$scope', 'profileService', 'go', 'correspondentListService', '$state', '$rootScope', '$log'];

  function CorrespondentDevicesCtrl($scope, profileService, go, correspondentListService, $state, $rootScope, $log) {
    const wallet = require('byteballcore/wallet.js');
    const vm = this;
    vm.editCorrespondentList = false;
    vm.selectedCorrespondentList = {};
    const fc = profileService.focusedClient;
    vm.backgroundColor = fc.backgroundColor;
    vm.state = $state;
    vm.hideRemove = true;

    vm.showCorrespondent = (correspondent) => {
      $log.debug('showCorrespondent', correspondent);
      correspondentListService.currentCorrespondent = correspondent;
      go.path('correspondentDevice');
    };

    vm.hideRemoveButton = removable => vm.hideRemove || !removable;

    vm.cancel = () => go.walletHome();

    vm.toggleEditCorrespondentList = () => {
      vm.editCorrespondentList = !vm.editCorrespondentList;
      vm.selectedCorrespondentList = {};
    };

    vm.toggleSelectCorrespondentList = (addr) => {
      vm.selectedCorrespondentList[addr] = !vm.selectedCorrespondentList[addr];
    };

    vm.readList = () => {
      vm.error = null;

      correspondentListService.getCorrespondentsOrderedByMessageDate().then((correspondents) => {
        correspondentListService.getPendingSharedAddresses().then((pendingAddresses) => {
          wallet.readDeviceAddressesUsedInSigningPaths((arrNotRemovableDeviceAddresses) => {
            correspondents.forEach((corrDev) => {
              const ixNotRemovable = arrNotRemovableDeviceAddresses.indexOf(corrDev.device_address);
              const ixPendingAddress = pendingAddresses.indexOf(corrDev.device_address);
              corrDev.removable = (ixNotRemovable === -1);
              corrDev.clickable = (corrDev.removable || ixPendingAddress !== -1);
            });
            vm.list = correspondents;
            $scope.$digest();
          });
        });
      }, (err) => {
        if (err) {
          $log.error('Error while reading correspondent device list', err);
          vm.error = err;
        }
      });
    };

    vm.remove = (deviceAddress) => {
      wallet.determineIfDeviceCanBeRemoved(deviceAddress, (bRemovable) => {
        const device = require('byteballcore/device.js');
        if (!bRemovable) {
          $log.info(`device ${deviceAddress} is not removable`);
          return;
        }
        device.sendMessageToDevice(deviceAddress, 'removed_paired_device', 'removed');
        device.removeCorrespondentDevice(deviceAddress, () => {
          vm.hideRemove = true;
          vm.readList();
          $rootScope.$emit('Local/SetTab', 'wallet.correspondentDevices', true);
        });
      });
    };

    vm.readList();
  }
})();
