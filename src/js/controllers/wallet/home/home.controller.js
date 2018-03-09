/* eslint-disable no-unused-vars */
(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('HomeCtrl', HomeCtrl);

  HomeCtrl.$inject = ['$scope', '$rootScope', '$location', '$anchorScroll', '$timeout', '$log', 'lodash', 'go', 'profileService',
    'configService', 'gettextCatalog', 'derivationPathHelper', 'correspondentListService', 'utilityService'];

  function HomeCtrl($scope, $rootScope, $location, $anchorScroll, $timeout, $log, lodash, go, profileService,
                       configService, gettextCatalog, derivationPathHelper, correspondentListService, utilityService) {
    const vm = this;

    // TODO sinan home methods will be written into this class
  }
})();
