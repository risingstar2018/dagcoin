(function () {
  'use strict';

  angular.module('dagcoin.services')
  .factory('bitcore', (bwcService) => {
    bwcService.getBitcore();
  });
}());
