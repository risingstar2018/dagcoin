(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('PreferencesAboutDeviceCtrl', PreferencesAboutDeviceCtrl);

  PreferencesAboutDeviceCtrl.$inject = [];

  function PreferencesAboutDeviceCtrl() {
    const vm = this;
    vm.myDeviceAddress = require('core/device.js').getMyDeviceAddress();
  }
})();
