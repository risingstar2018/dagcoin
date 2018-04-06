(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('PreferencesHubSettingsCtrl', PreferencesHubSettingsCtrl);

  PreferencesHubSettingsCtrl.$inject = ['$scope', 'configService'];

  function PreferencesHubSettingsCtrl($scope, $timeout, configService) {
    const vm = this;
    vm.settings = {};

    function viewContentLoaded() {
      const config = configService.getSync();
      alert(config.hub);
      vm.settings = {
        hub: config.hub
      };
    }

    vm.save = () => {

    };

    $scope.$on('$viewContentLoaded', viewContentLoaded);
  }
})();
