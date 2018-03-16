(() => {
  'use strict';

  /**
   * @desc custome icon directive
   * @example <dag-csv-history></dag-csv-history>
   */
  angular
    .module('copayApp.directives')
    .directive('dagCsvHistory', dagCsvHistory);

  dagCsvHistory.$inject = ['utilityService', 'profileService', 'configService', 'sharedService',
    '$rootScope', 'nodeWebkit', '$timeout', '$log', 'Device', 'gettextCatalog'];

  function dagCsvHistory(utilityService, profileService, configService, sharedService, $rootScope, nodeWebkit,
                         $timeout, $log, Device, gettextCatalog) {
    const isCordova = utilityService.isCordova;
    return {
      restrict: 'E',
      templateUrl: 'directives/dagCsvHistory/dagCsvHistory.template.html',
      replace: true,
      link: ($scope) => {
        $scope.csvHistory = () => {
          const fc = profileService.focusedClient;
          const config = configService.getSync();
          const dagUnitValue = config.wallet.settings.dagUnitValue;
          const currentWallet = sharedService.getCurrentWallet();
          csvHistory(currentWallet, fc, dagUnitValue);
        };
      }
    };

    /**
     * Extract tx history records as csv into a file
     *
     * @param currentWallet current selected wallet
     * @param fc focused client
     * @param dagUnitValue
     */
    function csvHistory(currentWallet, fc, dagUnitValue) {
      const CSV_CONTENT_ID = '__csv_content';

      function setCsvContent(data) {
        const csvElement = document.getElementById(CSV_CONTENT_ID);
        if (csvElement !== null) {
          csvElement.value = data;
        } else {
          $log.error(`Textarea element with id=${CSV_CONTENT_ID} not exits in DOM`);
        }
      }

      function saveFile(name, data) {
        const chooser = document.querySelector(name);
        setCsvContent(data);
        chooser.removeEventListener('change', () => {
        });
        chooser.addEventListener('change', function (evt) {
          const fs = require('fs');
          const csvElement = document.getElementById(CSV_CONTENT_ID);
          const csvContent = csvElement !== null
            ? document.getElementById(CSV_CONTENT_ID).value
            : `Textarea element with id=${CSV_CONTENT_ID} not exits in DOM`;
          fs.writeFile(this.value, csvContent, (err) => {
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
        let result = str;
        if (!result) {
          return '';
        }

        if (result.indexOf('"') !== -1) {
          // replace all
          result = result.replace(new RegExp('"', 'g'), '\'');
        }

        // escaping commas
        result = `\"${result}\"`;

        return result;
      }

      /**
       * Used when platform is cordova
       * Downloads file into window.cordova.file.documentsDirectory with a filename tailing with current time
       * @param uri
       */
      function saveFileIntoDownloadFolder(csvContent) {
        const errorCallback = function (e) {
          console.error(`Error: ${e}`);
          $rootScope.$emit('Local/ShowAlert', JSON.stringify(e), 'fi-alert', () => { });
        };

        // TODO move to fileSystemService as getDownloadDir. It only works with cordova.
        let storageLocation;
        if (Device.android) {
          storageLocation = 'file:///storage/emulated/0/';
        } else if (Device.iOS) {
          storageLocation = window.cordova.file.documentsDirectory;
        } else {
          alert('Could not detect device');
          return;
        }

        // Arrange file name, filter some special characters
        const date = new Date().toISOString().slice(0, 19)
          .replace(':', '')
          .replace('T', '-');
        const fileName = `${self.alias || self.walletName}-${date}.csv`
          .replace(/[ <>:,{}"\/\\|?*]+/g, '');

        window.resolveLocalFileSystemURL(storageLocation, (fileSystem) => {
          fileSystem.getDirectory('Download', {
            create: true,
            exclusive: false
          }, (directory) => {
            directory.getFile(fileName, {
              create: true,
              exclusive: false
            }, (fileEntry) => {
              fileEntry.createWriter((writer) => {
                writer.onwriteend = function () {
                  console.log(`${fileName} File written to downloads`);
                };
                writer.seek(0);
                const blob = new Blob([csvContent], { type: 'text/plain;charset=utf-8', endings: 'native' });
                writer.write(blob);
                const message = `${gettextCatalog.getString('Download completed')} : ${fileName}`;
                $rootScope.$emit('Local/ShowAlert', message, 'fi-check', () => { });
              }, errorCallback);
            }, errorCallback);
          }, errorCallback);
        }, errorCallback);
      }

      if (isCordova) {
        $log.info('CSV generation not available in mobile');
        return;
      }
      const isNode = nodeWebkit.isDefined();
      if (!fc.isComplete()) return;

      $log.debug('Generating CSV from History');
      // self.setOngoingProcess('generatingCSV', true);

      $timeout(() => {
        if (!currentWallet) {
          alert('Current Wallet is null');
          return;
        }
        fc.getTxHistory('base', currentWallet.shared_address, (txs) => {
          // self.setOngoingProcess('generatingCSV', false);
          $log.debug('Wallet Transaction History:', txs);

          const data = txs;
          const filename = `Dagcoin-${currentWallet.alias || currentWallet.walletName}.csv`;
          let csvContent;

          if (!isNode && !Device.any) {
            csvContent = 'data:text/csv;charset=utf-8,';
          } else {
            csvContent = 'Date,Destination,Note,Amount,Currency\n';
          }

          // let amount;
          let note;
          let dataString;
          data.forEach((it, index) => {
            console.log('Processing transactions number', index);
            let amount = it.amount;

            if (it.action === 'moved') {
              amount = 0;
            }

            amount = (it.action === 'sent' ? '-' : '') + amount;
            note = formatString(`${it.message ? it.message : ''} unit: ${it.unit}`);

            if (it.action === 'moved') {
              note += ` Moved:${it.amount}`;
            }

            dataString = `${formatDate(it.time * 1000)},${formatString(it.addressTo)},${note},${formatString((amount / dagUnitValue).toString())},dag`;
            csvContent += `${dataString}\n`;
          });

          if (isNode) {
            saveFile('#export_file', csvContent);
          } else if (Device.any) {
            saveFileIntoDownloadFolder(csvContent);
          } else {
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', filename);
            link.click();
          }

          $rootScope.$apply();
        });
      });
    }
  }
})();
