(function () {
  'use strict';

  angular.module('dagcoin.controllers').controller('versionController', function () {
    this.version = window.version;
    this.commitHash = window.commitHash;
  });
}());
