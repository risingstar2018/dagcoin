(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('BackupCtrl', BackupCtrl);

  BackupCtrl.$inject = ['$rootScope', '$scope', '$timeout', 'profileService', 'go', 'gettextCatalog', 'confirmDialog',
    'notification', '$log', 'storageService', 'fileSystemService', 'Device'];

  function BackupCtrl($rootScope, $scope, $timeout, profileService, go, gettextCatalog, confirmDialog, notification, $log,
                      storageService, fileSystemService, Device) {
    const vm = this;
    const fc = profileService.focusedClient;
    const async = require('async');
    const crypto = require('crypto');
    const conf = require('byteballcore/conf');
    const msg = gettextCatalog.getString('Are you sure you want to delete the backup words?');
    const successMsg = gettextCatalog.getString('Backup words deleted');
    let jsZip = null;
    let Zip = null;
    vm.show = false;
    vm.error = null;
    vm.passError = null;
    vm.success = null;
    vm.password = null;
    vm.repeatpassword = null;
    vm.exporting = false;
    vm.bCompression = false;
    vm.connection = null;
    vm.isCordova = Device.cordova;

    if (vm.isCordova) {
      const JSZip = require('jszip');
      jsZip = new JSZip();
      vm.text = gettextCatalog.getString(`To protect your funds, please use multisig wallets with redundancy, 
          e.g. 1-of-2 wallet with one key on this device and another key on your laptop computer. 
          Just the wallet seed is not enough.`);
    } else {
      const desktopApp = require('byteballcore/desktop_app.js');
      const appDataDir = desktopApp.getAppDataDir();
      Zip = require('zip');
      vm.text = gettextCatalog.getString(`To restore your wallets, you will need a full backup of Dagcoin data at ${appDataDir}.  
                     Better yet, use multisig wallets with redundancy, 
                     e.g. 1-of-2 wallet with one key on this device and another key on your smartphone.  
                     Just the wallet seed is not enough.`);
    }
    if (fc.isPrivKeyEncrypted()) {
      vm.credentialsEncrypted = true;
    } else {
      setWords(fc.getMnemonic());
    }
    if (fc.credentials && !fc.credentials.mnemonicEncrypted && !fc.credentials.mnemonic) {
      vm.deleted = true;
    }

    vm.toggle = toggle;
    vm.walletExportPC = walletExportPC;
    vm.passwordRequest = passwordRequest;
    vm.walletExportCordova = walletExportCordova;
    vm.walletExport = walletExport;

    vm.delete = function () {
      confirmDialog.show(msg, (ok) => {
        if (ok) {
          fc.clearMnemonic();
          profileService.clearMnemonic(() => {
            vm.deleted = true;
            $rootScope.$emit('Local/BackupDone');
            notification.success(successMsg);
            go.walletHome();
          });
        }
      });
    };

    function walletExport() {
      vm.error = '';
      if (!vm.password) {
        vm.passError = 'Please enter password';
      } else if (vm.password !== vm.repeatpassword) {
        vm.passError = 'These passwords don\'t match';
      } else {
        vm.passError = '';
      }
      if (vm.passError) {
        return;
      }
      vm.exporting = true;
      const db = require('byteballcore/db');
      db.takeConnectionFromPool((connection) => {
        if (vm.isCordova) {
          vm.walletExportCordova(connection);
        } else {
          vm.walletExportPC(connection);
        }
      });
    }

    function passwordRequest() {
      try {
        setWords(fc.getMnemonic());
      } catch (e) {
        if (e.message && e.message.match(/encrypted/) && fc.isPrivKeyEncrypted()) {
          vm.credentialsEncrypted = true;

          $timeout(() => {
            $scope.$apply();
          }, 1);

          profileService.unlockFC(null, (err) => {
            if (err) {
              vm.error = `${gettextCatalog.getString('Could not decrypt')}: ${err.message}`;
              $log.warn('Error decrypting credentials:', vm.error); // TODO
              return;
            }
            if (!vm.show && vm.credentialsEncrypted) {
              vm.show = !vm.show;
            }
            vm.credentialsEncrypted = false;
            setWords(fc.getMnemonic());
            $rootScope.$emit('Local/BackupDone');
          });
        }
      }
    }

    function walletExportCordova(connection) {
      storageService.getProfile((err, profile) => {
        storageService.getConfig((getConfigError, config) => {
          if (getConfigError) {
            return showError(getConfigError);
          }
          jsZip.file('profile', JSON.stringify(profile));
          jsZip.file('config', config);
          jsZip.file('light', 'true');
          return addDBAndConfToZip((addDBAndConfToZipErr) => {
            if (addDBAndConfToZipErr) {
              return showError(addDBAndConfToZipErr);
            }
            const zipParams = { type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 9 } };
            return jsZip.generateAsync(zipParams).then((zipFile) => {
              saveFile(encrypt(zipFile, vm.password), (encryptError) => {
                connection.release();
                if (encryptError) {
                  return showError(encryptError);
                }
                vm.exporting = false;
                return $timeout(() => {
                  $rootScope.$apply();
                  notification.success(gettextCatalog.getString('Success'), gettextCatalog.getString('Export completed successfully', {}));
                });
              });
            }, (generateAsyncError) => {
              showError(generateAsyncError);
            });
          });
        });
      });
    }

    function walletExportPC(connection) {
      vm.connection = connection;
      saveFile(null, (path) => {
        if (!path) return;
        const cipher = crypto.createCipher('aes-256-ctr', vm.password);
        jsZip = new Zip(path, {
          compressed: vm.bCompression ? 6 : 0,
          cipher,
        });
        storageService.getProfile((err, profile) => {
          storageService.getConfig((storageServiceError, config) => {
            if (storageServiceError) {
              return showError(storageServiceError);
            }
            jsZip.text('profile', JSON.stringify(profile));
            jsZip.text('config', config);
            if (conf.bLight) {
              jsZip.text('light', 'true');
            }
            return addDBAndConfToZip((addDBAndConfToZipError) => {
              if (addDBAndConfToZipError) {
                return showError(addDBAndConfToZipError);
              }
              return jsZip.end(() => {
                connection.release();
                vm.connection = null;
                vm.exporting = false;
                $timeout(() => {
                  $rootScope.$apply();
                  notification.success(gettextCatalog.getString('Success'), gettextCatalog.getString('Export completed successfully', {}));
                });
              });
            });
          });
        });
      });
    }

    function toggle() {
      vm.error = '';
      if (!vm.credentialsEncrypted) {
        vm.show = !vm.show;
      }
      if (vm.credentialsEncrypted) {
        vm.passwordRequest();
      }
      $timeout(() => {
        $scope.$apply();
      }, 1);
    }

    function setWords(words) {
      if (words) {
        vm.mnemonicWords = words.split(/[\u3000\s]+/);
        vm.mnemonicHasPassphrase = fc.mnemonicHasPassphrase();
        vm.useIdeograms = words.indexOf('\u3000') >= 0;
        vm.mnemonicWordsJoined = vm.mnemonicWords.join(' ');
      }
    }

    function addDBAndConfToZip(cb) {
      const dbDirPath = `${fileSystemService.getDatabaseDirPath()}/`;
      fileSystemService.readdir(dbDirPath, (err, listFilenames) => {
        if (err) {
          return cb(err);
        }
        const fileNameList = listFilenames.filter(name => (name === 'conf.json' || /\.sqlite/.test(name)));
        if (vm.isCordova) {
          return async.forEachSeries(fileNameList, (name, callback) => {
            fileSystemService.readFile(`${dbDirPath}/${name}`, (fileSystemServiceError, data) => {
              if (fileSystemServiceError) {
                return callback(fileSystemServiceError);
              }
              jsZip.file(name, data);
              return callback();
            });
          }, cb);
        }
        return async.forEachSeries(fileNameList, (name, callback) => {
          fileSystemService.getPath(`${dbDirPath}/${name}`, (fileSystemServiceErr, path) => {
            if (fileSystemServiceErr) {
              return callback(fileSystemServiceErr);
            }
            jsZip.file(name, path);
            return callback();
          });
        }, cb);
      });
    }

    function checkValueFileAndChangeStatusExported() {
      $timeout(() => {
        const inputFile = document.getElementById('nwExportInputFile');
        if (!inputFile.value && vm.exporting) {
          vm.exporting = false;
          $timeout(() => {
            $rootScope.$apply();
          });
        }
        if (!inputFile.value && vm.connection) {
          vm.connection.release();
          vm.connection = false;
        }
        window.removeEventListener('focus', checkValueFileAndChangeStatusExported, true);
      }, 1000);
    }

    function saveFile(file, cb) {
      const backupFilename = `Dagcoin${Date.now()}.encrypted`;
      if (!vm.isCordova) {
        const inputFile = document.getElementById('nwExportInputFile');
        inputFile.setAttribute('nwsaveas', backupFilename);
        inputFile.click();
        window.addEventListener('focus', checkValueFileAndChangeStatusExported, true);
        inputFile.onchange = function () {
          cb(this.value);
        };
      } else {
        fileSystemService.cordovaWriteFile((Device.iOS ? window.cordova.file.documentsDirectory : window.cordova.file.externalRootDirectory), 'Byteball', backupFilename, file, (err) => {
          cb(err);
        });
      }
    }

    function encrypt(buffer, password) {
      const bufferPassword = Buffer.from(password);
      const cipher = crypto.createCipheriv('aes-256-ctr', crypto.pbkdf2Sync(bufferPassword, '', 100000, 32, 'sha512'), crypto.createHash('sha1').update(bufferPassword).digest().slice(0, 16));
      const arrChunks = [];
      const CHUNK_LENGTH = 2003;
      for (let offset = 0; offset < buffer.length; offset += CHUNK_LENGTH) {
        arrChunks.push(cipher.update(buffer.slice(offset, Math.min(offset + CHUNK_LENGTH, buffer.length)), 'utf8'));
      }
      arrChunks.push(cipher.final());
      return Buffer.concat(arrChunks);
    }

    function showError(text) {
      vm.exporting = false;
      vm.error = text;
      $timeout(() => {
        $rootScope.$apply();
      });
      return false;
    }

    $scope.$on('$destroy', () => {
      profileService.lockFC();
    });
  }
})();
