(function () {
  'use strict';

  angular.module('copayApp.services')
  .factory('sjcl', bwcService => bwcService.getSJCL());
}());
