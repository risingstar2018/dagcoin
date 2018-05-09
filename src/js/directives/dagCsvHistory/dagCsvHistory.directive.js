(() => {
  'use strict';

  /**
   * @desc custome icon directive
   * @example <dag-csv-history></dag-csv-history>
   */
  angular
    .module('copayApp.directives')
    .directive('dagCsvHistory', dagCsvHistory);

  dagCsvHistory.$inject = ['profileService', 'configService', 'sharedService', '$rootScope', 'exportTransactions', 'gettextCatalog'];

  function dagCsvHistory(profileService, configService, sharedService, $rootScope, exportTransactions, gettextCatalog) {
    return {
      restrict: 'E',
      templateUrl: 'directives/dagCsvHistory/dagCsvHistory.template.html',
      replace: true,
      link: ($scope) => {
        $scope.csvHistory = () => {
          const fc = profileService.focusedClient;
          const config = configService.getSync();
          // in case of existing dagUnitValue control
          const unitValue = config.wallet.settings.dagUnitValue || config.wallet.settings.unitValue;
          const currentWallet = sharedService.getCurrentWallet();
          $rootScope.$emit('Local/generatingCSV', true);
          exportTransactions.toCsvFile(currentWallet, fc, unitValue,
            (fileName) => {
              $rootScope.$emit('Local/generatingCSV', false);
              $rootScope.$apply();
              const message = `${gettextCatalog.getString('Download completed')} : ${fileName}`;
              $rootScope.$emit('Local/ShowAlert', message, 'fi-check', () => { });
            },
            (err) => {
              $rootScope.$emit('Local/generatingCSV', false);
              $rootScope.$emit('Local/ShowAlert', JSON.stringify(err), 'fi-alert', () => { });
              $rootScope.$apply();
            });
        };
      }
    };
  }
})();
