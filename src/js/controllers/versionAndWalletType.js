(function () {
  'use strict';

  angular.module('copayApp.controllers').controller('versionAndWalletTypeController', function (gettextCatalog) {
    // wallet type
    const conf = require('byteballcore/conf.js');
    this.type = conf.bLight ? gettextCatalog.getString('light wallet') : gettextCatalog.getString('full wallet');
    this.version = window.version;
    this.commitHash = window.commitHash;
  });
}());
