(() => {
  'use strict';

  const fs = require('fs');

  angular
    .module('copayApp.services')
    .factory('exportTransactions', exportTransactions);

  exportTransactions.$inject = ['$q', '$log', 'isCordova', 'nodeWebkit', 'profileService', '$rootScope', 'ENV', '$timeout'];

  function exportTransactions($q, $log, isCordova, nodeWebkit, profileService, $rootScope, ENV, $timeout) {
    return {
      toCSV
    };

    function toCSV() {
      function saveFile(name, data) {
        const chooser = document.querySelector(name);
        chooser.addEventListener('change', function (evt) {
          fs.writeFile(this.value, data, (err) => {
            if (err) {
              $log.debug(evt, err);
            }
          });
          this.value = '';
        }, false);
        chooser.click();
      }

      function formatDate(date) {
        const dateObj = new Date(date);
        if (!dateObj) {
          $log.debug('Error formating a date');
          return 'DateError';
        }
        if (!dateObj.toJSON()) {
          return '';
        }

        return dateObj.toJSON();
      }

      function formatString(str) {
        let format = str;
        if (!format) {
          return '';
        }

        if (format.indexOf('"') !== -1) {
          // replace all
          format = format.replace(new RegExp('"', 'g'), '\'');
        }

        // escaping commas
        format = `\"${format}\"`;

        return format;
      }

      if (isCordova) {
        $log.info('CSV generation not available in mobile');
        return;
      }
      const isNode = nodeWebkit.isDefined();
      const fc = profileService.focusedClient;
      if (!fc.isComplete()) return;
      $log.debug('Generating CSV from History');

      return $q((resolve) => {
        $timeout(() => {
          fc.getTxHistory(ENV.DAGCOIN_ASSET, self.shared_address, (txs) => {
            $log.debug('Wallet Transaction History:', txs);

            const data = txs;
            const filename = `Dagcoin-${self.alias || self.walletName}.csv`;
            let csvContent = '';

            if (!isNode) csvContent = 'data:text/csv;charset=utf-8,';
            csvContent += 'Date,Destination,Note,Amount,Currency\n';

            let amount;
            let note;
            let dataString;
            data.forEach((it, index) => {
              console.log('Processing transactions number', index);
              amount = it.amount;

              if (it.action === 'moved') {
                amount = 0;
              }

              amount = (it.action === 'sent' ? '-' : '') + amount;
              note = formatString(`${it.message ? it.message : ''} unit: ${it.unit}`);

              if (it.action === 'moved') {
                note += ` Moved:${it.amount}`;
              }

              dataString = `${formatDate(it.time * 1000)},${formatString(it.addressTo)},${note},${amount},dag`;
              csvContent += `${dataString}\n`;
            });

            if (isNode) {
              saveFile('#export_file', csvContent);
            } else {
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute('download', filename);
              link.click();
            }
            resolve(true);
            $rootScope.$apply();
          });
        }, 1000);
      });
    }
  }
})();
