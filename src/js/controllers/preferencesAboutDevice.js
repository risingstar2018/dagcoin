(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('preferencesAboutDeviceController', preferencesAboutDeviceController);

  preferencesAboutDeviceController.$inject = [];

  function preferencesAboutDeviceController() {
    this.myDeviceAddress = require('byteballcore/device.js').getMyDeviceAddress();
  }
})();
