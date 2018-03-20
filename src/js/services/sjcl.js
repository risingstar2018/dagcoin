(function () {
  'use strict';

  angular.module('copayApp.services')
  .factory('sjcl', (bwcService) => {
    return bwcService.getSJCL();
  });
}());
