(function () {
  'use strict';

  angular.module('dagcoin.services')
  .factory('sjcl', (bwcService) => {
    const sjcl = bwcService.getSJCL();
    return sjcl;
  });
}());
