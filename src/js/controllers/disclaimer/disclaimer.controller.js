(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('DisclaimerCtrl', DisclaimerCtrl);

  DisclaimerCtrl.$inject = ['$scope', '$timeout', 'storageService', 'Device', '$rootScope'];

  function DisclaimerCtrl($scope, $timeout, storageService, Device, $rootScope) {
    const vm = this;
    if (!Device.cordova && process.platform === 'win32' && navigator.userAgent.indexOf('Windows NT 5.1') >= 0) {
      $rootScope.$emit('Local/ShowAlert', 'Windows XP is not supported', 'fi-alert', () => {
        process.exit();
      });
    }
    storageService.getDisclaimerFlag((err, val) => {
      vm.agreed = val;
      $timeout(() => {
        $scope.$digest();
      }, 1);
    });
  }
})();
