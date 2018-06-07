/* eslint-disable no-useless-concat,import/no-extraneous-dependencies,no-shadow */
(() => {
  'use strict';

  angular
  .module('copayApp.controllers')
  .controller('RecoveryCtrl', RecoveryCtrl);

  RecoveryCtrl.$inject = ['$rootScope', '$scope', '$state', '$log', '$timeout', 'profileService', 'gettextCatalog', 'fileSystemService',
                          'configService', 'storageService', 'Device'];

  function RecoveryCtrl($rootScope, $scope, $state, $log, $timeout, profileService, gettextCatalog, fileSystemService,
                        configService, storageService, Device) {
    const async = require('async');
    const conf = require('core/conf.js');
    const walletDefinedByKeys = require('core/wallet_defined_by_keys.js');
    const objectHash = require('core/object_hash.js');
    let ecdsa;
    try {
      ecdsa = require('secp256k1');
    } catch (e) {
      ecdsa = require('core/node_modules/secp256k1' + '');
    }
    const Mnemonic = require('bitcore-mnemonic');
    const Bitcore = require('bitcore-lib');
    const db = require('core/db.js');
    const network = require('core/network');
    const myWitnesses = require('core/my_witnesses');

    const self = this;
    const JSZip = require('jszip');
    const crypto = require('crypto');
    const userAgent = navigator.userAgent;
    let zip;
    let unzip;
    self.imported = false;
    self.password = '';
    self.iOs = Device.iOS;
    self.android = Device.android;
    self.arrBackupFiles = [];
    self.androidVersion = self.android ? parseFloat(userAgent.slice(userAgent.indexOf('Android') + 8)) : null;
    self.oldAndroidFilePath = null;
    self.oldAndroidFileName = '';
    self.isInitial = $state.includes('initialRecovery');
    self.recoverFromSeedError = '';
    self.recoverFromFullBackupError = '';
    self.bLight = conf.bLight;
    self.scanning = false;
    self.inputMnemonic = '';
    self.xPrivKey = '';
    self.assocIndexesToWallets = {};
    self.isInitial = $state.includes('initialRecovery');
    if (Device.cordova) {
      zip = new JSZip();
    } else {
      unzip = require('unzip');
    }

    self.oldAndroidInputFileClick = oldAndroidInputFileClick;
    self.walletImport = walletImport;
    self.iosWalletImportFromFile = iosWalletImportFromFile;
    self.recoveryForm = recoveryForm;
    self.onFileSelected = onFileSelected;

    self.getFile = () => {
      $timeout(() => {
        $rootScope.$apply();
      });
    };

    function iosWalletImportFromFile(fileName) {
      $rootScope.$emit('Local/NeedsPassword', false, null, (err, password) => {
        if (password) {
          const backupDirPath = `${window.cordova.file.documentsDirectory}/Byteball/`;
          fileSystemService.readFile(backupDirPath + fileName, (fileSystemServiceError, data) => {
            if (fileSystemServiceError) {
              return showError(fileSystemServiceError, 'full');
            }
            return unzipAndWriteFiles(data, password);
          });
        }
      });
    }

    function recoveryForm() {
      if (self.inputMnemonic) {
        self.recoverFromSeedError = '';
        self.inputMnemonic = self.inputMnemonic.toLowerCase();

        if ((self.inputMnemonic.split(' ').length % 3 === 0) && Mnemonic.isValid(self.inputMnemonic)) {
          self.scanning = true;

          if (self.isInitial) {
            const device = require('core/device.js');
            const opts = { deviceName: 'RECOVER_FROM_SEED' };
            device.setDeviceName(opts.deviceName);
            configService.set(opts, () => {
              profileService.create({ noWallet: false }, () => $timeout(() => {
                $rootScope.$emit('Local/InitialRecoveryInProgress');
                scanForAddressesAndWalletsInLightClient(self.inputMnemonic, cleanAndAddWalletsAndAddresses);
              }, 1000));
            });
          } else if (self.bLight) {
            scanForAddressesAndWalletsInLightClient(self.inputMnemonic, cleanAndAddWalletsAndAddresses);
          } else {
            scanForAddressesAndWallets(self.inputMnemonic, cleanAndAddWalletsAndAddresses);
          }
        } else {
          showError(gettextCatalog.getString('Seed is not valid'), 'seed');
        }
      }
    }

    function onFileSelected(file) {
      self.file = file;
    }

    function walletImport() {
      self.imported = true;
      self.recoverFromFullBackupError = '';
      if (self.android && self.androidVersion < 5) {
        fileSystemService.readFile(self.oldAndroidFilePath, (err, data) => {
          unzipAndWriteFiles(data, self.password);
        });
      } else {
        fileSystemService.readFileFromForm(self.file, (err, data) => {
          if (err) {
            return showError(err, 'full');
          }
          return unzipAndWriteFiles(data, self.password);
        });
      }
    }

    function oldAndroidInputFileClick() {
      window.plugins.mfilechooser.open([], (uri) => {
        self.oldAndroidFilePath = `file://${uri}`;
        self.oldAndroidFileName = uri.split('/').pop();
        $timeout(() => {
          $rootScope.$apply();
        });
      }, (error) => {
        alert(error);
      });
    }

    function generateListFilesForIos() {
      const backupDirPath = `${window.cordova.file.documentsDirectory}/Byteball/`;
      fileSystemService.readdir(backupDirPath, (err, listFilenames) => {
        if (listFilenames) {
          listFilenames.forEach((name) => {
            const dateNow = parseInt(name.split(' ')[1], 10);
            self.arrBackupFiles.push({
              name: name.replace(dateNow, new Date(dateNow).toLocaleString()),
              originalName: name,
              time: dateNow
            });
          });
        }
        $timeout(() => {
          $rootScope.$apply();
        });
      });
    }

    if (self.iOs) {
      generateListFilesForIos();
    }

    function writeDBAndFileStorageMobile(zipfiles, cb) {
      const db = require('core/db');
      const dbDirPath = `${fileSystemService.getDatabaseDirPath()}/`;
      db.close(() => {
        async.forEachOfSeries(zipfiles.files, (objFile, key, callback) => {
          if (key === 'profile') {
            zipfiles.file(key).async('string').then((data) => {
              storageService.storeProfile(Profile.fromString(data), callback);
            });
          } else if (key === 'config') {
            zipfiles.file(key).async('string').then((data) => {
              storageService.storeConfig(data, callback);
            });
          } else if (/\.sqlite/.test(key)) {
            zipfiles.file(key).async('nodebuffer').then((data) => {
              fileSystemService.cordovaWriteFile(dbDirPath, null, key, data, callback);
            });
          } else {
            callback();
          }
        }, (err) => {
          if (err) return cb(err);
          return cb();
        });
      });
    }

    function writeDBAndFileStoragePC(cb) {
      const db = require('core/db');
      const dbDirPath = `${fileSystemService.getDatabaseDirPath()}/`;
      db.close(() => {
        async.series([
          function (callback) {
            fileSystemService.readFile(`${dbDirPath}temp/profile`, (err, data) => {
              if (err) {
                return callback(err);
              }
              return storageService.storeProfile(Profile.fromString(data.toString()), callback);
            });
          },
          function (callback) {
            fileSystemService.readFile(`${dbDirPath}temp/config`, (err, data) => {
              if (err) {
                return callback(err);
              }
              return storageService.storeConfig(data.toString(), callback);
            });
          },
          function (callback) {
            fileSystemService.readdir(`${dbDirPath}temp/`, (err, fileNames) => {
              const names = fileNames.filter(name => /\.sqlite/.test(name));
              async.forEach(names, (name, callback2) => {
                fileSystemService.nwMoveFile(`${dbDirPath}temp/${name}`, dbDirPath + name, callback2);
              }, (error) => {
                if (error) {
                  return callback(error);
                }
                return callback();
              });
            });
          },
          function (callback) {
            const existsConfJson = fileSystemService.nwExistsSync(`${dbDirPath}temp/conf.json`);
            const existsLight = fileSystemService.nwExistsSync(`${dbDirPath}temp/light`);
            const conf = require('core/conf');
            if (existsConfJson) {
              fileSystemService.nwMoveFile(`${dbDirPath}temp/conf.json`, `${dbDirPath}conf.json`, callback);
            } else if (existsLight && !existsConfJson) {
              fileSystemService.nwWriteFile(`${dbDirPath}conf.json`, JSON.stringify({ bLight: true }, null, '\t'), 'utf8', callback);
            } else if (!existsLight && conf.bLight) {
              const config = require(`${dbDirPath}conf.json`);
              config.bLight = false;
              fileSystemService.nwWriteFile(`${dbDirPath}conf.json`, JSON.stringify(config, null, '\t'), 'utf8', callback);
            } else {
              callback();
            }
          },
          function (callback) {
            fileSystemService.readdir(`${dbDirPath}temp/`, (err, fileNames) => {
              async.forEach(fileNames, (name, callback2) => {
                fileSystemService.nwUnlink(`${dbDirPath}temp/${name}`, callback2);
              }, (fileSystemServiceError) => {
                if (fileSystemServiceError) {
                  return callback(fileSystemServiceError);
                }
                return fileSystemService.nwRmDir(`${dbDirPath}temp/`, () => {
                  callback();
                });
              });
            });
          }
        ], (err) => {
          cb(err);
        });
      });
    }

    function decrypt(buffer, password) {
      const bufferPassword = Buffer.from(password);
      const decipher = crypto.createDecipheriv('aes-256-ctr', crypto.pbkdf2Sync(bufferPassword, '', 100000, 32, 'sha512'), crypto.createHash('sha1').update(bufferPassword).digest().slice(0, 16));
      const arrChunks = [];
      const CHUNK_LENGTH = 2003;
      for (let offset = 0; offset < buffer.length; offset += CHUNK_LENGTH) {
        arrChunks.push(decipher.update(buffer.slice(offset, Math.min(offset + CHUNK_LENGTH, buffer.length)), 'utf8'));
      }
      arrChunks.push(decipher.final());
      return Buffer.concat(arrChunks);
    }

    function showError(text, tab) {
      $log.error(text);
      self.imported = false;

      if (tab === 'seed') {
        self.recoverFromSeedError = text;
      } else {
        self.recoverFromFullBackupError = text;
      }

      $timeout(() => {
        $rootScope.$apply();
      });
      return false;
    }

    function unzipAndWriteFiles(data, password) {
      if (Device.cordova) {
        zip.loadAsync(decrypt(data, password)).then((zippedFile) => {
          if (!zippedFile.file('light')) {
            self.imported = false;
            showError(gettextCatalog.getString('Mobile version supports only light wallets.'), 'full');
          } else {
            writeDBAndFileStorageMobile(zippedFile, (err) => {
              if (err) {
                return showError(err, 'full');
              }
              self.imported = false;
              return $rootScope.$emit('Local/ShowAlert', gettextCatalog.getString('Import successfully completed, please restart the application.'), 'fi-check', () => {
                if (navigator && navigator.app) {
                  navigator.app.exitApp();
                } else if (process.exit) {
                  process.exit();
                }
              });
            });
          }
        }, (err) => {
          $log.error(err);
          showError('Incorrect password or file', 'full');
        });
      } else {
        const decipher = crypto.createDecipher('aes-256-ctr', password);
        data.pipe(decipher).pipe(unzip.Extract({ path: `${fileSystemService.getDatabaseDirPath()}/temp/` }).on('close', () => {
          writeDBAndFileStoragePC((err) => {
            if (err) {
              return showError(err, 'full');
            }
            self.imported = false;
            return $rootScope.$emit('Local/ShowAlert', gettextCatalog.getString('Import successfully completed, please restart the application.'), 'fi-check', () => {
              if (navigator && navigator.app) {
                navigator.app.exitApp();
              } else if (process.exit) {
                process.exit();
              }
            });
          });
        })).on('error', (err) => {
          if (err.message === 'Invalid signature in zip file') {
            return showError('Incorrect password or file', 'full');
          }
          return showError(err, 'full');
        });
      }
    }

    function determineIfAddressUsed(address, cb) {
      db.query('SELECT 1 FROM outputs WHERE address = ? LIMIT 1', [address], (outputsRows) => {
        if (outputsRows.length === 1) { cb(true); } else {
          db.query('SELECT 1 FROM unit_authors WHERE address = ? LIMIT 1', [address], (unitAuthorsRows) => {
            cb(unitAuthorsRows.length === 1);
          });
        }
      });
    }

    function scanForAddressesAndWallets(mnemonic, cb) {
      self.xPrivKey = new Mnemonic(mnemonic).toHDPrivateKey();
      let xPubKey;
      let lastUsedAddressIndex = -1;
      let lastUsedWalletIndex = -1;
      let currentAddressIndex = 0;
      let currentWalletIndex = 0;
      const assocMaxAddressIndexes = {};

      function checkAndAddCurrentAddress(isChange) {
        const address = objectHash.getChash160(['sig', { pubkey: walletDefinedByKeys.derivePubkey(xPubKey, `m/${isChange}/${currentAddressIndex}`) }]);
        determineIfAddressUsed(address, (bUsed) => {
          if (bUsed) {
            lastUsedAddressIndex = currentAddressIndex;
            if (!assocMaxAddressIndexes[currentWalletIndex]) assocMaxAddressIndexes[currentWalletIndex] = { main: 0 };
            if (isChange) {
              assocMaxAddressIndexes[currentWalletIndex].change = currentAddressIndex;
            } else {
              assocMaxAddressIndexes[currentWalletIndex].main = currentAddressIndex;
            }
            currentAddressIndex += 1;
            checkAndAddCurrentAddress(isChange);
          } else {
            currentAddressIndex += 1;
            if (currentAddressIndex - lastUsedAddressIndex >= 20) {
              if (isChange) {
                if (lastUsedAddressIndex !== -1) {
                  lastUsedWalletIndex = currentWalletIndex;
                }
                if (currentWalletIndex - lastUsedWalletIndex >= 20) {
                  cb(assocMaxAddressIndexes);
                } else {
                  currentWalletIndex += 1;
                  setCurrentWallet();
                }
              } else {
                currentAddressIndex = 0;
                checkAndAddCurrentAddress(1);
              }
            } else {
              checkAndAddCurrentAddress(isChange);
            }
          }
        });
      }

      function setCurrentWallet() {
        xPubKey = Bitcore.HDPublicKey(self.xPrivKey.derive(`m/44'/0'/${currentWalletIndex}'`));
        lastUsedAddressIndex = -1;
        currentAddressIndex = 0;
        checkAndAddCurrentAddress(0);
      }

      setCurrentWallet();
    }

    function removeAddressesAndWallets(cb) {
      const arrQueries = [];
      db.addQuery(arrQueries, 'DELETE FROM pending_shared_address_signing_paths');
      db.addQuery(arrQueries, 'DELETE FROM shared_address_signing_paths');
      db.addQuery(arrQueries, 'DELETE FROM pending_shared_addresses');
      db.addQuery(arrQueries, 'DELETE FROM shared_addresses');
      db.addQuery(arrQueries, 'DELETE FROM my_addresses');
      db.addQuery(arrQueries, 'DELETE FROM wallet_signing_paths');
      db.addQuery(arrQueries, 'DELETE FROM extended_pubkeys');
      db.addQuery(arrQueries, 'DELETE FROM wallets');
      db.addQuery(arrQueries, 'DELETE FROM correspondent_devices');

      async.series(arrQueries, cb);
    }

    function createAddresses(assocMaxAddressIndexes, cb) {
      const accounts = Object.keys(assocMaxAddressIndexes);
      let currentAccount = 0;

      function addAddress(wallet, isChange, index, maxIndex) {
        walletDefinedByKeys.issueAddress(wallet, isChange, index, () => {
          let ind = index;
          ind += 1;
          if (ind <= maxIndex) {
            addAddress(wallet, isChange, ind, maxIndex);
          } else if (isChange) {
            currentAccount += 1;
            if (currentAccount < accounts.length) {
              startAddToNewWallet(0);
            } else {
              cb();
            }
          } else {
            startAddToNewWallet(1);
          }
        });
      }

      function startAddToNewWallet(isChange) {
        if (isChange) {
          if (assocMaxAddressIndexes[accounts[currentAccount]].change !== undefined) {
            addAddress(self.assocIndexesToWallets[accounts[currentAccount]], 1, 0, assocMaxAddressIndexes[accounts[currentAccount]].change);
          } else {
            currentAccount += 1;
            if (currentAccount < accounts.length) {
              startAddToNewWallet(0);
            } else {
              cb();
            }
          }
        } else {
          addAddress(self.assocIndexesToWallets[accounts[currentAccount]], 0, 0, assocMaxAddressIndexes[accounts[currentAccount]].main + 20);
        }
      }

      startAddToNewWallet(0);
    }

    function createWallets(arrWalletIndexes, cb) {
      function createWallet(n) {
        let walletIndex = n;
        const account = parseInt(arrWalletIndexes[walletIndex], 10);
        const opts = {};
        opts.m = 1;
        opts.n = 1;
        opts.name = `Wallet #${account}`;
        opts.network = 'livenet';
        opts.cosigners = [];
        opts.extendedPrivateKey = self.xPrivKey;
        opts.mnemonic = self.inputMnemonic;
        opts.account = account;

        profileService.createWallet(opts, (err, walletId) => {
          self.assocIndexesToWallets[account] = walletId;
          walletIndex += 1;
          if (walletIndex < arrWalletIndexes.length) {
            createWallet(walletIndex);
          } else {
            cb();
          }
        });
      }

      createWallet(0);
    }

    function scanForAddressesAndWalletsInLightClient(mnemonic, cb) {
      self.xPrivKey = new Mnemonic(mnemonic).toHDPrivateKey();
      let xPubKey;
      let currentWalletIndex = 0;
      let lastUsedWalletIndex = -1;
      const assocMaxAddressIndexes = {};

      function checkAndAddCurrentAddresses(isChange) {
        if (!assocMaxAddressIndexes[currentWalletIndex]) {
          assocMaxAddressIndexes[currentWalletIndex] = {
            main: 0,
            change: 0
          };
        }
        const arrTmpAddresses = [];
        for (let i = 0; i < 20; i += 1) {
          const index = (isChange ? assocMaxAddressIndexes[currentWalletIndex].change : assocMaxAddressIndexes[currentWalletIndex].main) + i;
          arrTmpAddresses.push(objectHash.getChash160(['sig', { pubkey: walletDefinedByKeys.derivePubkey(xPubKey, `m/${isChange}/${index}`) }]));
        }
        myWitnesses.readMyWitnesses((arrWitnesses) => {
          network.requestFromLightVendor('light/get_history', {
            addresses: arrTmpAddresses,
            witnesses: arrWitnesses
          }, (ws, request, response) => {
            if (response && response.error) {
              const breadcrumbs = require('core/breadcrumbs.js');
              breadcrumbs.add(`Error scanForAddressesAndWalletsInLightClient: ${response.error}`);
              showError(gettextCatalog.getString('When scanning an error occurred, please try again later.'), 'seed');
              self.scanning = false;
              return;
            }
            if (Object.keys(response).length) {
              lastUsedWalletIndex = currentWalletIndex;
              if (isChange) {
                assocMaxAddressIndexes[currentWalletIndex].change += 20;
              } else {
                assocMaxAddressIndexes[currentWalletIndex].main += 20;
              }
              checkAndAddCurrentAddresses(isChange);
            } else if (isChange) {
              if (assocMaxAddressIndexes[currentWalletIndex].change === 0
                && assocMaxAddressIndexes[currentWalletIndex].main === 0) {
                delete assocMaxAddressIndexes[currentWalletIndex];
              }
              currentWalletIndex += 1;
              if (currentWalletIndex - lastUsedWalletIndex > 3) {
                cb(assocMaxAddressIndexes);
              } else {
                setCurrentWallet();
              }
            } else {
              checkAndAddCurrentAddresses(1);
            }
          });
        });
      }

      function setCurrentWallet() {
        xPubKey = Bitcore.HDPublicKey(self.xPrivKey.derive(`m/44'/0'/${currentWalletIndex}'`));
        checkAndAddCurrentAddresses(0);
      }
      setCurrentWallet();
    }

    function cleanAndAddWalletsAndAddresses(assocMaxAddressIndexes) {
      const device = require('core/device');
      const arrWalletIndexes = Object.keys(assocMaxAddressIndexes);
      if (arrWalletIndexes.length) {
        removeAddressesAndWallets(() => {
          const myDeviceAddress = objectHash.getDeviceAddress(ecdsa.publicKeyCreate(self.xPrivKey.derive("m/1'").privateKey.bn.toBuffer({ size: 32 }), true).toString('base64'));
          profileService.replaceProfile(self.xPrivKey.toString(), self.inputMnemonic, myDeviceAddress, () => {
            device.setDevicePrivateKey(self.xPrivKey.derive("m/1'").privateKey.bn.toBuffer({ size: 32 }));
            createWallets(arrWalletIndexes, () => {
              createAddresses(assocMaxAddressIndexes, () => {
                self.scanning = false;
                storageService.clearBackupFlag('all', () => {
                  const alertContent = gettextCatalog.getString(`${arrWalletIndexes.length} wallets recovered, please restart the application to finish.`);
                  $rootScope.$emit('Local/ShowAlert', alertContent, 'fi-check', () => {
                    if (navigator && navigator.app) {  // android
                      navigator.app.exitApp();
                    } else if (process.exit) { // nwjs
                      process.exit();
                    }
                  });
                });
              });
            });
          });
        });
      } else {
        showError(gettextCatalog.getString('No active addresses found.'), 'seed');
        self.scanning = false;
      }
    }
  }
})();
