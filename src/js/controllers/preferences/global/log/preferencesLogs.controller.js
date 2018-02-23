(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('PreferencesLogsCtrl', PreferencesLogsCtrl);

  PreferencesLogsCtrl.$inject = ['historicLog', 'gettextCatalog'];

  function PreferencesLogsCtrl(historicLog, gettextCatalog) {
    const vm = this;
    vm.logs = historicLog.get();

    vm.sendLogs = function () {
      let body = gettextCatalog.getString('Dagcoin Session Logs\n Be careful, this could contain sensitive private data\n\n');
      body += '\n\n';
      body += vm.logs.map(v => v.msg).join('\n');

      window.plugins.socialsharing.shareViaEmail(
        body,
        gettextCatalog.getString('Dagcoin Logs'),
        null, // TO: must be null or an array
        null, // CC: must be null or an array
        null, // BCC: must be null or an array
        null, // FILES: can be null, a string, or an array
        () => {
        },
        () => {
        }
      );
    };
  }
})();
