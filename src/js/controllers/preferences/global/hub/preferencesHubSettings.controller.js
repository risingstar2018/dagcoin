(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('PreferencesHubSettingsCtrl', PreferencesHubSettingsCtrl);

  PreferencesHubSettingsCtrl.$inject = ['$rootScope', '$scope', '$state', '$timeout', 'configService', 'ENV', '$log',
    'gettextCatalog'];

  function PreferencesHubSettingsCtrl($rootScope, $scope, $state, $timeout, configService, ENV, $log, gettextCatalog) {
    const vm = this;
    vm.settings = {};

    function viewContentLoaded() {
      const config = configService.getSync();
      vm.defaultHub = configService.getDefaults().hub;
      vm.initialHub = config.hub;
      vm.settings = {
        hub: config.hub
      };
    }

    function showNotificationForRestartApplication() {
      const message = gettextCatalog.getString('Hub successfully changed, please restart the application.');
      $rootScope.$emit('Local/ShowAlert', message, 'fi-check', () => {
        if (navigator && navigator.app) {
          navigator.app.exitApp();
        } else if (process.exit) {
          process.exit();
        }
      });
    }

    vm.save = () => {
      const opts = { hub: vm.settings.hub };
      configService.set(opts, (err) => {
        if (err) {
          $scope.$emit('Local/DeviceError', err);
          return;
        }
        console.log(`Hub was changed to ${vm.settings.hub}`);
        showNotificationForRestartApplication();
      });
    };

    vm.resetHub = () => {
      vm.settings.hub = ENV.hub;
      vm.save();
    };

    vm.isSaveDisabled = () => vm.settings.hub.trim() === '' || vm.initialHub === vm.settings.hub;
    vm.isResetHubVisible = () => vm.defaultHub !== vm.settings.hub && vm.defaultHub !== vm.initialHub;

    $scope.$on('$viewContentLoaded', viewContentLoaded);
  }
})();
