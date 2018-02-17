(function () {
  'use strict';

  angular.module('dagcoin.controllers').controller('topbarController', function ($scope, $rootScope, go) {
    this.onBeforeScan = function () {
    };

    this.goHome = function () {
      go.walletHome();
    };
  });
}());
