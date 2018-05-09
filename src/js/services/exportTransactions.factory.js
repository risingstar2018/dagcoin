(() => {
  'use strict';

  angular
    .module('copayApp.services')
    .factory('exportTransactions', exportTransactions);

  exportTransactions.$inject = ['$q', '$log', 'lodash', 'Device', 'nodeWebkit', 'profileService', 'utilityService', 'fileSystemService',
    'ENV', '$timeout'];

  function exportTransactions($q, $log, lodash, Device, nodeWebkit, profileService, utilityService, fileSystemService,
                              ENV, $timeout) {
    return {
      toCsvFile
    };

    /**
     * Extract tx history records as csv into a file
     *
     * @param currentWallet current selected wallet
     * @param fc focused client
     * @param unitValue
     * @param successCb fileName is sent as parameter
     * @param failureCb error is send as parameter
     */
    function toCsvFile(currentWallet, fc, unitValue, successCb, failureCb) {
      const isMobile = utilityService.isMobile();
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
          const fileName = this.value;
          fs.writeFile(this.value, csvContent, (err) => {
            if (err) {
              $log.debug(evt, err);
              if (failureCb) {
                failureCb(err);
              }
            } else if (successCb) {
              successCb(fileName);
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
       * window.cordova.file.documentsDirectory variable is set just for iOS.
       * For Android @see fileSystemService.getDeviceStorageDir
       * @param uri
       */
      function saveFileIntoDownloadFolder(csvContent) {
        const errorCallback = function (e) {
          console.error(`Error: ${e}`);
          if (failureCb) {
            failureCb(e);
          }
        };

        const storageLocation = fileSystemService.getDeviceStorageDir();
        if (lodash.isEmpty(storageLocation)) {
          $log.debug('Could not detect device');
          if (failureCb) {
            failureCb('Could not detect device');
          }
          return;
        }

        // Arrange file name, filter some special characters
        const date = new Date().toISOString().slice(0, 19)
          .replace(':', '')
          .replace('T', '-');
        const fileName = `${currentWallet.alias || currentWallet.walletName}-${date}.csv`
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
                if (successCb) {
                  successCb(fileName);
                }
              }, errorCallback);
            }, errorCallback);
          }, errorCallback);
        }, errorCallback);
      }

      const isNode = nodeWebkit.isDefined();
      if (!fc.isComplete()) return;

      $log.debug('Generating CSV from History');

      $timeout(() => {
        if (!currentWallet) {
          alert('Current Wallet is null');
          return;
        }
        fc.getTxHistory('base', currentWallet.shared_address, (txs) => {
          $log.debug('Wallet Transaction History:', txs);

          const data = txs;
          const filename = `Dagcoin-${currentWallet.alias || currentWallet.walletName}.csv`;
          let csvContent;

          if (!isNode && !isMobile) {
            csvContent = 'data:text/csv;charset=utf-8,';
          } else {
            csvContent = 'Date,Destination,Note,Amount,Currency\n';
          }

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
              note += ` Moved:${it.amount / unitValue}`;
            }
            dataString = `${formatDate(it.time * 1000)},${formatString(it.addressTo)},${note},${formatString((amount / unitValue).toString())},dag`;
            dataString = dataString.replace(/"/g, '');
            csvContent += `${dataString}\n`;
          });

          if (isNode) {
            saveFile('#export_file', csvContent);
          } else if (isMobile) {
            saveFileIntoDownloadFolder(csvContent);
          } else {
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', filename);
            link.click();
          }
        });
      });
    }
  }
})();
