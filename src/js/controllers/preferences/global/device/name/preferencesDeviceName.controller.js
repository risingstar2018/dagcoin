(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('PreferencesDeviceNameCtrl', PreferencesDeviceNameCtrl);

  PreferencesDeviceNameCtrl.$inject = ['$scope', '$timeout', 'configService', '$state'];

  function PreferencesDeviceNameCtrl($scope, $timeout, configService, $state) {
    const vm = this;
    const config = configService.getSync();
    vm.deviceName = config.deviceName;

    vm.save = function () {
      const device = require('core/device.js');
      device.setDeviceName(vm.deviceName);
      const opts = { deviceName: vm.deviceName };

      configService.set(opts, (err) => {
        if (err) {
          $scope.$emit('Local/DeviceError', err);
          return;
        }
        $timeout(() => {
          $state.go('system');
        }, 50);
      });
    };

    $scope.$watch('prefDeviceName.deviceName', (newValue, oldValue) => {
      if (typeof newValue !== 'undefined') {
        if (newValue.length > 50) {
          vm.deviceName = oldValue;
        }
      }
    });
  }
})();
