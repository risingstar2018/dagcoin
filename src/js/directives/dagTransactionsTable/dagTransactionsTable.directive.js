(() => {
  'use strict';

  /**
   * @desc Transactions table
   * @param List of transactions
   * @example <dag-transactions-table transactions></dag-transactions-table>
   */
  angular
    .module('copayApp.directives')
    .directive('dagTransactionsTable', dagTransactionsTable);

  dagTransactionsTable.$inject = ['moment', 'transactionsService', '$rootScope', 'configService'];

  function dagTransactionsTable(moment, transactionsService, $rootScope, configService) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'directives/dagTransactionsTable/dagTransactionsTable.template.html',
      scope: {
        transactions: '='
      },
      link: ($scope) => {
        const today = moment().format('DD/MM/YYYY');
        const yesterday = moment().subtract(1, 'day').format('DD/MM/YYYY');

        $scope.formatDate = (value) => {
          if (value === today) {
            return 'Today';
          } else if (value === yesterday) {
            return 'Yesterday';
          }
          return value;
        };

        $scope.formatSum = (sum) => {
          const string = sum.toString().split('.');

          if (!string[1]) {
            return `${sum}.00`;
          }

          if (string[1] && string[1].length === 1) {
            return `${sum}0`;
          }
          return sum;
        };

        $scope.transactionAddress = address => transactionsService.getTransactionAddress(address);

        $scope.transactionStatus = transaction => transactionsService.getTransactionStatus(transaction);

        $scope.openTxModal = (btx) => {
          const config = configService.getSync();
          const configWallet = config.wallet;
          const walletSettings = configWallet.settings;
          transactionsService.openTxModal({
            btx,
            walletSettings,
            $rootScope
          });
        };
      }
    };
  }
})();
