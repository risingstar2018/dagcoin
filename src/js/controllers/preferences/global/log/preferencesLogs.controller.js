(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('PreferencesLogsCtrl', PreferencesLogsCtrl);

  PreferencesLogsCtrl.$inject = ['$window', '$scope', '$timeout', 'historicLog', 'gettextCatalog', 'ngDialog', 'lodash',
    'configService', 'utilityService'];

  function PreferencesLogsCtrl($window, $scope, $timeout, historicLog, gettextCatalog, ngDialog, lodash,
                               configService, utilityService) {
    const vm = this;
    vm.isCordova = utilityService.isCordova;


    function loadLogs(level) {
      $scope.filteringLogs = true;
      vm.logs = historicLog.get(level);
      $scope.hasLogForCurrentLevel = vm.logs.length > 0;
      if (vm.logs.length === 0) {
        vm.logs = [{ msg: `Error level:${configService.getSync().logLevel}, No error for this level.` }];
      }
      $scope.filteringLogs = false;
    }

    function viewContentLoaded() {
      const config = configService.getSync();
      loadLogs(config.logLevel);
    }

    function getLogContent() {
      const config = configService.getSync();
      return historicLog.writeLogsToString(config.logLevel);
    }

    vm.sendLogs = function () {
      const logContent = getLogContent();
      if (lodash.isEmpty(logContent)) {
        console.warn('Log content is empty');
        return;
      }
      const entry = gettextCatalog.getString('Dagcoin Session Logs\n Be careful, this could contain sensitive private data\n\n');
      const body = `${entry}\n\n${logContent}`;

      const subject = gettextCatalog.getString('Dagcoin Logs');
      if (vm.isCordova) {
        window.plugins.socialsharing.shareViaEmail(
          body,
          subject,
          null, // TO: must be null or an array
          null, // CC: must be null or an array
          null, // BCC: must be null or an array
          null, // FILES: can be null, a string, or an array
          () => {
          },
          () => {
          }
        );
      }
    };

    vm.showLogSettings = function () {
      ngDialog.open({
        template: 'controllers/preferences/global/log/logSettings.template.html',
        controller: 'LogSettingsModalCtrl',
        scope: $scope // parent scope
      });
    };

    vm.copyToClipboard = function () {
      const logContent = getLogContent();
      if (lodash.isEmpty(logContent)) {
        console.warn('Log content is empty');
        return;
      }
      utilityService.copyAddress($scope, logContent);
    };

    $scope.$on('Local/LogLevelChanged', (event, level) => {
      loadLogs(level);
    });

    $scope.$on('$viewContentLoaded', viewContentLoaded);
  }
})();
