/* eslint-disable no-unused-vars,no-mixed-operators,no-use-before-define,new-cap,
no-nested-ternary,no-shadow,no-plusplus,consistent-return,import/no-extraneous-dependencies,import/no-unresolved, no-undef */
(function () {
  'use strict';

  angular.module('copayApp.controllers').controller('indexController',
      function ($rootScope,
                $scope,
                $log,
                $filter,
                $timeout,
                $interval,
                lodash,
                go,
                fingerprintService,
                profileService,
                configService,
                Device,
                storageService,
                addressService,
                gettextCatalog,
                amMoment,
                nodeWebkit,
                txFormatService,
                uxLanguage,
                $state,
                addressbookService,
                notification,
                animationService,
                $modal,
                bwcService,
                backButton,
                faucetService,
                changeWalletTypeService,
                autoRefreshClientService,
                connectionService,
                sharedService,
                newVersion,
                ENV,
                moment) {
        const async = require('async');
        const constants = require('byteballcore/constants.js');
        const mutex = require('byteballcore/mutex.js');
        const eventBus = require('byteballcore/event_bus.js');
        const objectHash = require('byteballcore/object_hash.js');
        const ecdsaSig = require('byteballcore/signature.js');
        const breadcrumbs = require('byteballcore/breadcrumbs.js');
        const Bitcore = require('bitcore-lib');
        const isCordova = Device.cordova;
        const _ = require('lodash');
        breadcrumbs.add('index.js');
        const self = this;
        self.isSafari = Device.safari;
        self.onGoingProcess = {};
        self.updatingTxHistory = true;
        self.bSwipeSuspended = false;
        self.$state = $state;
        // self.usePushNotifications = isCordova && !isMobile.Windows() && isMobile.Android();
        self.usePushNotifications = false;

        self.triggerUrl = (state) => {
          $state.go(state);
        };

        connectionService.init();
        $rootScope.$on('connection:state-changed', (ev, isOnline) => {
          self.isOffline = !isOnline;
        });

        if (isCordova && constants.version === '1.0') {
          const db = require('byteballcore/db.js');
          db.query('SELECT 1 FROM units WHERE version!=? LIMIT 1', [constants.version], (rows) => {
            if (rows.length > 0) {
              $rootScope.$emit('Local/ShowErrorAlert', 'Looks like you have testnet data.  Please remove the app and reinstall.', () => {
                if (navigator && navigator.app) {
                  // android
                  navigator.app.exitApp();
                }
                // ios doesn't exit
              });
            }
          });
        }


        self.showPopup = function (msg, msgIcon, cb) {
          $log.warn(`Showing ${msgIcon} popup:${msg}`);

          if (window && !!window.chrome && !!window.chrome.webstore && msg.includes('access is denied for this document')) {
            return false;
          }

          self.showAlert = {
            msg: msg.toString(),
            msg_icon: msgIcon,
            close(err) {
              self.showAlert = null;
              if (cb) return cb(err);
            }
          };
          $timeout(() => {
            $rootScope.$apply();
          });
        };

        self.showErrorPopup = function (msg, cb) {
          $log.warn(`Showing err popup:${msg}`);
          self.showPopup(msg, 'fi-alert', cb);
        };

        self.setOngoingProcess = function (processName, isOn) {
          $log.debug('onGoingProcess', processName, isOn);
          self[processName] = isOn;
          self.onGoingProcess[processName] = isOn;

          let name;
          self.anyOnGoingProcess = lodash.any(self.onGoingProcess, (isOn, processName) => {
            if (isOn) {
              name = name || processName;
            }
            return isOn;
          });
          // The first one
          self.onGoingProcessName = name;
          $timeout(() => {
            $rootScope.$apply();
          });
        };

        const indexEventsSupport = new IndexEventsSupport({
          Device,
          Raven,
          go,
          $rootScope,
          changeWalletTypeService,
          self,
          $timeout,
          profileService,
          notification,
          gettextCatalog,
          newVersion
        });
        indexEventsSupport.initNotFatalError();
        indexEventsSupport.initUncaughtError();

        // catchupBallsAtStart variable is used in eventBus event.
        // TODO sinan move this variable into indexEventsSupport class
        self.catchupBallsAtStart = -1;
        indexEventsSupport.initCatchingUpStarted();
        indexEventsSupport.initCatchupBallsLeft();
        indexEventsSupport.initCatchingUpDone();
        indexEventsSupport.initRefreshLightStarted();
        indexEventsSupport.initRefreshLightDone();
        indexEventsSupport.initRefusedToSign();
        indexEventsSupport.initNewMyTransactions();
        indexEventsSupport.initMyTransactionsBecameStable();
        indexEventsSupport.initMciBecameStable();
        indexEventsSupport.initMaybeNewTransactions();
        indexEventsSupport.initWalletApproved();
        indexEventsSupport.initWalletDeclined();
        indexEventsSupport.initWalletCompleted();

        // eventBus.on('confirm_on_other_devices', () => {
        // // todo: originally the mesage was: 'Transaction created. \nPlease approve it on the other devices.'. we have to bring this back and think about better solution.
        // $rootScope.$emit('Local/ShowAlert', 'Transaction created.', 'fi-key', () => {
        // go.walletHome();
        // });
        // });


        /*
         eventBus.on("transaction_sent", function(){
         self.updateAll();
         self.updateTxHistory();
         });
        */

        const acceptMessage = gettextCatalog.getString('Yes');
        const cancelMessage = gettextCatalog.getString('No');
        const confirmMessage = gettextCatalog.getString('Confirm');

        const modalRequestApproval = function (question, callbacks) {
          const ModalInstanceCtrl = function ($scope, $modalInstance, $sce) {
            $scope.header = $sce.trustAsHtml('Request approval');
            $scope.title = $sce.trustAsHtml(question);
            $scope.yes_icon = 'fi-check';
            $scope.yes_button_class = 'primary';
            $scope.cancel_button_class = 'warning';
            $scope.cancel_label = 'No';
            $scope.loading = false;

            $scope.ok = function () {
              $scope.loading = true;
              $modalInstance.close(acceptMessage);
            };
            $scope.cancel = function () {
              $modalInstance.dismiss(cancelMessage);
            };
          };

          const modalInstance = $modal.open({
            templateUrl: 'views/modals/confirmation.html',
            windowClass: animationService.modalAnimated.slideUp,
            controller: ModalInstanceCtrl,
          });

          modalInstance.result.finally(() => {
            const m = angular.element(document.getElementsByClassName('reveal-modal'));
            m.addClass(animationService.modalAnimated.slideOutDown);
          });

          modalInstance.result.then(callbacks.ifYes, callbacks.ifNo);
        };

        const requestApproval = function (question, callbacks) {
          if (isCordova) {
            navigator.notification.confirm(
              question,
              (buttonIndex) => {
                if (buttonIndex === 1) {
                  callbacks.ifYes();
                } else {
                  callbacks.ifNo();
                }
              },
              confirmMessage, [acceptMessage, cancelMessage]);
          } else {
            modalRequestApproval(question, callbacks);
          }
        };

        // TODO sinan, it uses requestApproval->modal methods, after merging move this into index.events.support.js
        // in arrOtherCosigners, 'other' is relative to the initiator
        eventBus.on('create_new_wallet', (walletId, arrWalletDefinitionTemplate, arrDeviceAddresses, walletName, arrOtherCosigners, isSingleAddress) => {
          const device = require('byteballcore/device.js');
          const walletDefinedByKeys = require('byteballcore/wallet_defined_by_keys.js');
          device.readCorrespondentsByDeviceAddresses(arrDeviceAddresses, (arrCorrespondentInfos) => {
            // my own address is not included in arrCorrespondentInfos because I'm not my correspondent
            const arrNames = arrCorrespondentInfos.map(correspondent => correspondent.name);
            const nameList = arrNames.join(', ');
            const question = gettextCatalog.getString(`Create new wallet ${walletName} together with ${nameList} ?`);
            requestApproval(question, {
              ifYes() {
                console.log('===== YES CLICKED');
                const createNewWallet = function () {
                  walletDefinedByKeys.readNextAccount((account) => {
                    const walletClient = bwcService.getClient();
                    if (!profileService.focusedClient.credentials.xPrivKey) {
                      throw Error('no profileService.focusedClient.credentials.xPrivKeyin createNewWallet');
                    }
                    walletClient.seedFromExtendedPrivateKey(profileService.focusedClient.credentials.xPrivKey, account);
                    // walletClient.seedFromMnemonic(profileService.profile.mnemonic, {account: account});
                    walletDefinedByKeys.approveWallet(
                      walletId,
                      walletClient.credentials.xPubKey,
                      account,
                      arrWalletDefinitionTemplate,
                      arrOtherCosigners, () => {
                        walletClient.credentials.walletId = walletId;
                        walletClient.credentials.network = 'livenet';
                        const n = arrDeviceAddresses.length;
                        const m = arrWalletDefinitionTemplate[1].required || n;
                        walletClient.credentials.addWalletInfo(walletName, m, n);
                        profileService.updatePublicKeyRing(walletClient);
                        profileService.addWalletClient(walletClient, {}, () => {
                          if (isSingleAddress) {
                            profileService.setSingleAddressFlag(true);
                          }
                          console.log(`switched to newly approved wallet ${walletId}`);
                        });
                      });
                  });
                };
                if (profileService.focusedClient.credentials.xPrivKey) {
                  createNewWallet();
                } else {
                  profileService.insistUnlockFC(null, createNewWallet);
                }
              },
              ifNo() {
                console.log('===== NO CLICKED');
                walletDefinedByKeys.cancelWallet(walletId, arrDeviceAddresses, arrOtherCosigners);
              }
            });
          });
        });

        // units that were already approved or rejected by user.
        // if there are more than one addresses to sign from,
        // we won't pop up confirmation dialog for each address,
        // instead we'll use the already obtained approval
        const assocChoicesByUnit = {};

        // TODO sinan, it uses requestApproval->modal methods, after merging move this into index.events.support.js
        // objAddress is local wallet address, top_address is the address that requested the signature,
        // it may be different from objAddress if it is a shared address
        eventBus.on('signing_request', (objAddress, topAddress, objUnit, assocPrivatePayloads, fromAddress, signingPath) => {
          function createAndSendSignature() {
            const coin = '0';
            const path = `m/44'/${coin}'/${objAddress.account}'/${objAddress.is_change}/${objAddress.address_index}`;
            console.log(`path ${path}`);
            // focused client might be different from the wallet this signature is for, but it doesn't matter as we have a single key for all wallets
            if (profileService.focusedClient.isPrivKeyEncrypted()) {
              console.log('priv key is encrypted, will be back after password request');
              return profileService.insistUnlockFC(null, () => {
                createAndSendSignature();
              });
            }
            const xPrivKey = new Bitcore.HDPrivateKey.fromString(profileService.focusedClient.credentials.xPrivKey);
            const privateKey = xPrivKey.derive(path).privateKey;
            console.log('priv key:', privateKey);
            // var privKeyBuf = privateKey.toBuffer();
            const privKeyBuf = privateKey.bn.toBuffer({ size: 32 }); // https://github.com/bitpay/bitcore-lib/issues/47
            console.log('priv key buf:', privKeyBuf);
            const bufToSign = objectHash.getUnitHashToSign(objUnit);
            const signature = ecdsaSig.sign(bufToSign, privKeyBuf);
            console.log(`sent signature ${signature}`);
            const bbWallet = require('byteballcore/wallet.js');
            return bbWallet.sendSignature(fromAddress, bufToSign.toString('base64'), signature, signingPath, topAddress);
          }

          function refuseSignature() {
            const bufToSign = objectHash.getUnitHashToSign(objUnit);
            const bbWallet = require('byteballcore/wallet.js');
            bbWallet.sendSignature(fromAddress, bufToSign.toString('base64'), '[refused]', signingPath, topAddress);
            console.log('refused signature');
          }

          const walletDefinedByKeys = require('byteballcore/wallet_defined_by_keys.js');
          const unit = objUnit.unit;
          const credentials = lodash.find(profileService.profile.credentials, { walletId: objAddress.wallet });
          mutex.lock([`signing_request-${unit}`], (unlock) => {
            // apply the previously obtained decision.
            // Unless the priv key is encrypted in which case the password
            // request would have appeared from nowhere
            if (assocChoicesByUnit[unit] && !profileService.focusedClient.isPrivKeyEncrypted()) {
              if (assocChoicesByUnit[unit] === 'approve') {
                createAndSendSignature();
              } else if (assocChoicesByUnit[unit] === 'refuse') {
                refuseSignature();
              }
              return unlock();
            }

            return walletDefinedByKeys.readChangeAddresses(objAddress.wallet, (arrChangeAddressInfos) => {
              const arrAuthorAddresses = objUnit.authors.map(author => author.address);
              let arrChangeAddresses = arrChangeAddressInfos.map(info => info.address);
              arrChangeAddresses = arrChangeAddresses.concat(arrAuthorAddresses);
              arrChangeAddresses.push(topAddress);
              const arrPaymentMessages = objUnit.messages.filter(objMessage => (objMessage.app === 'payment'));
              if (arrPaymentMessages.length === 0) {
                throw Error('no payment message found');
              }
              const assocAmountByAddress = {};
              // exclude outputs paying to my change addresses
              async.eachSeries(
                arrPaymentMessages,
                (objMessage, cb) => {
                  let payload = objMessage.payload;
                  if (!payload) {
                    payload = assocPrivatePayloads[objMessage.payload_hash];
                  }
                  if (!payload) {
                    throw Error(`no inline payload and no private payload either, message=${JSON.stringify(objMessage)}`);
                  }
                  if (!payload.outputs) {
                    throw Error('no outputs');
                  }
                  payload.outputs.forEach((output) => {
                    if (arrChangeAddresses.indexOf(output.address) === -1) {
                      if (!assocAmountByAddress[output.address]) {
                        assocAmountByAddress[output.address] = 0;
                      }
                      assocAmountByAddress[output.address] += output.amount;
                    }
                  });
                  cb();
                },
                () => {
                  const arrDestinations = [];
                  const walletSettings = configService.getSync().wallet.settings;

                  Object.keys(assocAmountByAddress).forEach((address) => {
                    const currency = 'bytes';
                    const value = assocAmountByAddress[address] / walletSettings.unitValue;
                    arrDestinations.push(`${value} ${currency} to ${address}`);
                  });
                  const dest = (arrDestinations.length > 0) ? arrDestinations.join(', ') : 'to myself';
                  const question = gettextCatalog.getString(`Sign transaction spending ${dest} from wallet ${credentials.walletName}?`);
                  requestApproval(question, {
                    ifYes() {
                      createAndSendSignature();
                      assocChoicesByUnit[unit] = 'approve';
                      unlock();
                    },
                    ifNo() {
                      // do nothing
                      console.log('===== NO CLICKED');
                      refuseSignature();
                      assocChoicesByUnit[unit] = 'refuse';
                      unlock();
                    }
                  });
                }); // eachSeries
            });
          });
        });

        self.selectSubWallet = function (sharedAddress) {
          const walletDefinedByAddresses = require('byteballcore/wallet_defined_by_addresses');
          self.shared_address = sharedAddress;
          if (sharedAddress) {
            walletDefinedByAddresses.determineIfHasMerkle(sharedAddress, (bHasMerkle) => {
              self.bHasMerkle = bHasMerkle;
              walletDefinedByAddresses.readSharedAddressCosigners(sharedAddress, (cosigners) => {
                self.shared_address_cosigners = cosigners.map(cosigner => cosigner.name).join(', ');
                $timeout(() => {
                  $rootScope.$apply();
                });
              });
            });
          } else {
            self.bHasMerkle = false;
          }

          self.updateAll();
        };

        self.openSubwalletModal = function () {
          $rootScope.modalOpened = true;
          const fc = profileService.focusedClient;

          const ModalInstanceCtrl = function ($scope, $modalInstance) {
            $scope.color = fc.backgroundColor;
            $scope.indexCtl = self;
            const arrSharedWallets = [];
            $scope.mainWalletBalanceInfo = _.find(self.arrMainWalletBalances, { asset: 'base' });
            $scope.asset = 'base';
            const assocSharedByAddress = $scope.mainWalletBalanceInfo.assocSharedByAddress;

            if (assocSharedByAddress) {
              Object.keys(assocSharedByAddress).forEach((sa) => {
                const objSharedWallet = {};
                objSharedWallet.shared_address = sa;
                objSharedWallet.total = assocSharedByAddress[sa];
                objSharedWallet.totalStr = `${profileService.formatAmount(assocSharedByAddress[sa], 'dag')}`;

                arrSharedWallets.push(objSharedWallet);
              });
              $scope.arrSharedWallets = arrSharedWallets;
            }

            $scope.cancel = function () {
              breadcrumbs.add('openSubwalletModal cancel');
              $modalInstance.dismiss('cancel');
            };

            $scope.selectSubwallet = function (sharedAddress) {
              self.shared_address = sharedAddress;
              if (sharedAddress) {
                const walletDefinedByAddresses = require('byteballcore/wallet_defined_by_addresses.js');
                walletDefinedByAddresses.determineIfHasMerkle(sharedAddress, (bHasMerkle) => {
                  self.bHasMerkle = bHasMerkle;
                  $rootScope.$apply();
                });
              } else {
                self.bHasMerkle = false;
              }
              self.updateAll();
              self.updateTxHistory();
              $modalInstance.close();
            };
          };

          const modalInstance = $modal.open({
            templateUrl: 'views/modals/select-subwallet.html',
            windowClass: animationService.modalAnimated.slideUp,
            controller: ModalInstanceCtrl
          });

          const disableCloseModal = $rootScope.$on('closeModal', () => {
            breadcrumbs.add('openSubwalletModal on closeModal');
            modalInstance.dismiss('cancel');
          });

          modalInstance.result.finally(() => {
            $rootScope.modalOpened = false;
            disableCloseModal();
            const m = angular.element(document.getElementsByClassName('reveal-modal'));
            m.addClass(animationService.modalAnimated.slideOutDown);
          });
        };

        self.goHome = function () {
          go.walletHome();
        };

        self.tab = 'walletHome.home';

        self.setFocusedWallet = function () {
          const fc = profileService.focusedClient;
          if (!fc) return;

          breadcrumbs.add(`setFocusedWallet ${fc.credentials.walletId}`);

          // Clean status
          self.totalBalanceBytes = null;
          self.lockedBalanceBytes = null;
          self.availableBalanceBytes = null;
          self.pendingAmount = null;
          self.spendUnconfirmed = null;

          self.totalBalanceStr = null;
          self.availableBalanceStr = null;
          self.lockedBalanceStr = null;

          self.arrBalances = [];
          self.assetIndex = 0;
          self.shared_address = null;
          self.bHasMerkle = false;

          self.txHistory = [];
          self.completeHistory = [];
          self.txProgress = 0;
          self.historyShowShowAll = false;
          self.balanceByAddress = null;
          self.pendingTxProposalsCountForUs = null;
          self.setSpendUnconfirmed();

          $timeout(() => {
            // $rootScope.$apply();
            self.hasProfile = true;
            self.noFocusedWallet = false;
            self.onGoingProcess = {};

            // Credentials Shortcuts
            self.m = fc.credentials.m;
            self.n = fc.credentials.n;
            self.network = fc.credentials.network;
            self.requiresMultipleSignatures = fc.credentials.m > 1;
            // self.isShared = fc.credentials.n > 1;
            self.walletName = fc.credentials.walletName;
            self.walletId = fc.credentials.walletId;
            self.isComplete = fc.isComplete();
            self.canSign = fc.canSign();
            self.isPrivKeyExternal = fc.isPrivKeyExternal();
            self.isPrivKeyEncrypted = fc.isPrivKeyEncrypted();
            self.externalSource = fc.getPrivKeyExternalSourceName();
            self.account = fc.credentials.account;

            self.txps = [];
            self.copayers = [];
            self.updateColor();
            self.updateAlias();
            self.setAddressbook();

            console.log('reading cosigners');
            const walletDefinedByKeys = require('byteballcore/wallet_defined_by_keys.js');
            walletDefinedByKeys.readCosigners(self.walletId, (arrCosignerInfos) => {
              self.copayers = arrCosignerInfos;
              $timeout(() => {
                $rootScope.$digest();
              });
            });

            if (fc.isPrivKeyExternal()) {
              self.needsBackup = false;
            } else {
              storageService.getBackupFlag('all', (err, val) => {
                self.needsBackup = !val;
              });
            }
            self.openWallet();
            self.updateSingleAddressFlag();
            sharedService.setCurrentWallet({
              walletId: self.walletId,
              walletName: self.walletName,
              alias: self.alias,
              shared_address: self.shared_address
            });
          });
        };

        self.setTab = function (tab, reset, tries, switchState) {
          console.log('index controller setTab', tab, reset, tries, switchState);
          const setTabTries = tries || 0;

          // TODO sinan when walletHome removed, fix here. below code is bad
          const normalizedTab = tab;
          $rootScope.tab = normalizedTab;
          self.tab = normalizedTab;

          const changeTab = function (tab) {
            // TODO sinan no effect, after testing remove 'Local/TabChanged'
            $rootScope.$emit('Local/TabChanged', tab);
          };

          // check if the whole menu item passed
          if (typeof tab === 'object') {
            if (!tab.new_state) backButton.clearHistory();
            if (tab.open) {
              if (tab.link) {
                $rootScope.tab = tab.link;
                self.tab = tab.link;
              }
              tab.open();
              return;
            } else if (tab.new_state) {
              changeTab(tab.link);
              $rootScope.tab = tab.link;
              self.tab = tab.link;
              go.path(tab.new_state);
              return;
            }
            return self.setTab(tab.link, reset, setTabTries, switchState);
          }
          console.log(`current tab ${self.tab}, requested to set tab ${tab}, reset=${reset}`);
          if (self.tab === tab && !reset) {
            return;
          }
          changeTab(tab);
        };

        self.updateAll = function (opts) {
          const options = opts || {};

          const fc = profileService.focusedClient;
          if (!fc) {
            return breadcrumbs.add('updateAll no fc');
          }

          if (!fc.isComplete()) {
            return breadcrumbs.add('updateAll not complete yet');
          }

          // reconnect if lost connection
          const device = require('byteballcore/device.js');
          device.loginToHub();

          return $timeout(() => {
            if (!options.quiet) {
              self.setOngoingProcess('updatingStatus', true);
            }

            $log.debug('Updating Status:', fc.credentials.walletName);
            if (!options.quiet) {
              self.setOngoingProcess('updatingStatus', false);
            }

            fc.getBalance(self.shared_address, (err, assocBalances, assocSharedBalances) => {
              if (err) {
                throw Error('impossible getBal');
              }
              $log.debug('updateAll Wallet Balance:', assocBalances, assocSharedBalances);

              self.setBalance(assocBalances, assocSharedBalances);
              // Notify external addons or plugins
              $rootScope.$emit('Local/BalanceUpdated', assocBalances);
              if (!self.isPrivKeyEncrypted) {
                $rootScope.$emit('Local/BalanceUpdatedAndWalletUnlocked', assocBalances);
              }
            });

            self.otherWallets = lodash.filter(profileService.getWallets(self.network), w => (w.id !== self.walletId || self.shared_address));

            // $rootScope.$apply();

            if (options.triggerTxUpdate) {
              $timeout(() => {
                breadcrumbs.add('triggerTxUpdate');
                self.updateTxHistory();
              }, 1);
            }
          });
        };

        self.setSpendUnconfirmed = function () {
          self.spendUnconfirmed = configService.getSync().wallet.spendUnconfirmed;
        };

        self.updateBalance = function () {
          const fc = profileService.focusedClient;
          $timeout(() => {
            self.setOngoingProcess('updatingBalance', true);
            $log.debug('Updating Balance');
            fc.getBalance(self.shared_address, (err, assocBalances, assocSharedBalances) => {
              self.setOngoingProcess('updatingBalance', false);
              if (err) {
                throw Error('impossible error from getBalance');
              }
              $log.debug('updateBalance Wallet Balance:', assocBalances, assocSharedBalances);
              self.setBalance(assocBalances, assocSharedBalances);
            });
          });
        };

        self.openWallet = function () {
          console.log('index.openWallet called');
          const fc = profileService.focusedClient;
          breadcrumbs.add(`openWallet ${fc.credentials.walletId}`);
          $timeout(() => {
            // $rootScope.$apply();
            self.setOngoingProcess('openingWallet', true);
            self.updateError = false;
            fc.openWallet((err, walletStatus) => {
              self.setOngoingProcess('openingWallet', false);
              if (err) {
                throw Error('impossible error from openWallet');
              }
              $log.debug('Wallet Opened');
              self.updateAll(lodash.isObject(walletStatus) ? {
                walletStatus
              } : null);
              // $rootScope.$apply();
            });
          });
        };

        self.processNewTxs = function (txs) {
          // const config = configService.getSync().wallet.settings;
          const now = Math.floor(Date.now() / 1000);
          const ret = [];

          lodash.each(txs, (tx) => {
            const transaction = txFormatService.processTx(tx);

            // no future transactions...
            if (transaction.time > now) {
              transaction.time = now;
            }
            ret.push(transaction);
          });

          return ret;
        };

        self.updateAlias = function () {
          const config = configService.getSync();
          config.aliasFor = config.aliasFor || {};
          self.alias = config.aliasFor[self.walletId];
          const fc = profileService.focusedClient;
          fc.alias = self.alias;
        };

        self.updateColor = function () {
          self.backgroundColor = '#d51f26';
          const fc = profileService.focusedClient;
          fc.backgroundColor = '#d51f26';
        };

        self.updateSingleAddressFlag = function () {
          const config = configService.getSync();
          config.isSingleAddress = config.isSingleAddress || {};
          self.isSingleAddress = config.isSingleAddress[self.walletId];
          const fc = profileService.focusedClient;
          fc.isSingleAddress = self.isSingleAddress;
        };

        self.setBalance = function (assocBalances, assocSharedBalances) {
          if (!assocBalances) return;
          const config = configService.getSync().wallet.settings;

          // Selected unit
          self.unitValue = config.unitValue;
          self.unitName = config.unitName;

          self.arrBalances = [];

          Object.keys(assocBalances).forEach((asset) => {
            const balanceInfo = assocBalances[asset];
            balanceInfo.asset = asset;
            balanceInfo.total = balanceInfo.stable + balanceInfo.pending;
            if (assocSharedBalances[asset]) {
              balanceInfo.shared = 0;
              balanceInfo.assocSharedByAddress = {};
              Object.keys(assocSharedBalances[asset]).forEach((sa) => {
                const totalOnSharedAddress = (assocSharedBalances[asset][sa].stable || 0) + (assocSharedBalances[asset][sa].pending || 0);
                balanceInfo.shared += totalOnSharedAddress;
                balanceInfo.assocSharedByAddress[sa] = totalOnSharedAddress;
              });
            }

            const assetName = 'base';
            balanceInfo.totalStr = profileService.formatAmount(balanceInfo.total, assetName);
            balanceInfo.stableStr = profileService.formatAmount(balanceInfo.stable, assetName);
            balanceInfo.pendingStr = `${profileService.formatAmount(balanceInfo.pending, assetName)} ${config.unitName}`;
            if (balanceInfo.shared) {
              balanceInfo.sharedStr = profileService.formatAmount(balanceInfo.shared, assetName);
            }

            self.arrBalances.push(balanceInfo);
          });
          self.assetIndex = self.assetIndex || 0;
          if (!self.arrBalances[self.assetIndex]) {
            // if no such index in the subwallet, reset to bytes
            self.assetIndex = 0;
          }
          if (!self.shared_address) {
            self.arrMainWalletBalances = self.arrBalances;
          }

          self.baseBalance = _.find(self.arrBalances, { asset: 'base' });
          console.log(`========= setBalance done, balances: ${JSON.stringify(self.arrBalances)}`);
          breadcrumbs.add(`setBalance done, balances: ${JSON.stringify(self.arrBalances)}`);

          $timeout(() => {
            $rootScope.$apply();
          });
        };

        self.checkTransactionsAreConfirmed = function (oldHistory, newHistory) {
          if (oldHistory && newHistory && oldHistory.length > 0) {
            lodash.each(oldHistory, (tx) => {
              const newTx = lodash.find(newHistory, { unit: tx.unit });

              if (newTx && tx.confirmations === 0 && newTx.confirmations === 1) {
                const confirmedMessage = 'Your transaction has been confirmed';

                notification.success(gettextCatalog.getString('Success'), gettextCatalog.getString(confirmedMessage));
              }
            });
          }
        };

        self.updateLocalTxHistory = function (client, cb) {
          const walletId = client.credentials.walletId;
          const walletSettings = configService.getSync().wallet.settings;
          breadcrumbs.add(`index: ${self.assetIndex}; balances: ${JSON.stringify(self.arrBalances)}`);
          if (!client.isComplete()) {
            return console.log('fc incomplete yet');
          }
          return client.getTxHistory('base', self.shared_address, (txs) => {
            const newHistory = self.processNewTxs(txs);
            $log.debug(`Tx History synced. Total Txs: ${newHistory.length}`);
            self.checkTransactionsAreConfirmed(self.txHistory, newHistory);

            if (walletId === profileService.focusedClient.credentials.walletId) {
              self.txHistory = newHistory;
              self.visible_rows = 0;

              self.completeHistory = {};

              for (let x = 0, maxLen = self.txHistory.length; x < maxLen; x += 1) {
                const t = self.txHistory[x];
                const timestamp = t.time * 1000;
                const date = moment(timestamp).format('DD/MM/YYYY');

                if (!self.completeHistory[date]) {
                  self.completeHistory[date] = { balance: 0, rows: [] };
                }

                if (t.action === 'received') {
                  self.completeHistory[date].balance += (t.amount / walletSettings.unitValue);
                } else {
                  self.completeHistory[date].balance -= (t.amount / walletSettings.unitValue);
                }

                self.completeHistory[date].rows.push(t);
                self.visible_rows += 1;
              }

              self.historyShowShowAll = newHistory.length >= self.historyShowLimit;
              $rootScope.$apply();
            }

            return cb();
          });
        };

        self.showAllHistory = function () {
          self.historyShowShowAll = false;
          self.historyRendering = true;
          $timeout(() => {
            $rootScope.$apply();
            $timeout(() => {
              self.historyRendering = false;
              self.txHistory = self.completeHistory;
            }, 100);
          }, 100);
        };

        self.updateHistory = function (cb) {
          const fc = profileService.focusedClient;
          const walletId = fc.credentials.walletId;

          if (!fc.isComplete()) {
            if (lodash.isFunction(cb)) {
              try {
                cb(false);
              } catch (e) {
                console.error(e);
              }
            }
            return;
          }

          $rootScope.$emit('Local/UpdateHistoryStart');

          $log.debug('Updating Transaction History for walletId', walletId);
          self.txHistoryError = false;
          self.updatingTxHistory = true;
          self.setOngoingProcess('updatingHistory', true);

          $timeout(() => {
            self.updateLocalTxHistory(fc, (err) => {
              self.updatingTxHistory = false;
              self.setOngoingProcess('updatingHistory', false);
              if (err) {
                self.txHistoryError = true;
              }

              $rootScope.$emit('Local/UpdateHistoryEnd');
              $rootScope.$apply();
              if (lodash.isFunction(cb)) {
                try {
                  cb(lodash.isEmpty(err));
                } catch (e) {
                  console.error(e);
                }
              }
            });
          });
        };

        self.updateTxHistory = lodash.debounce(() => {
          self.updateHistory();
        }, 1000);

        self.onClick = function () {
          console.log('== click');
          self.oldAssetIndex = self.assetIndex;
        };

        // for light clients only
        self.updateHistoryFromNetwork = lodash.throttle(() => {
          setTimeout(() => {
            if (self.assetIndex !== self.oldAssetIndex) {
              // it was a swipe
              console.log('== swipe');
              return;
            }
            console.log('== updateHistoryFromNetwork');
            const lightWallet = require('byteballcore/light_wallet.js');
            lightWallet.refreshLightClientHistory();
          }, 500);
        }, 5000);

        self.recreate = function () {
          const fc = profileService.focusedClient;
          self.setOngoingProcess('recreating', true);
          fc.recreateWallet((err) => {
            self.setOngoingProcess('recreating', false);

            if (err) {
              throw Error('impossible err from recreateWallet');
            }

            profileService.setWalletClients();
            $timeout(() => {
              $rootScope.$emit('Local/WalletImported', self.walletId);
            }, 100);
          });
        };

        self.openMenu = () => {
          backButton.menuOpened = true;
          go.swipe(true);
        };

        $rootScope.openMenu = () => {
          self.openMenu();
        };

        self.closeMenu = () => {
          backButton.menuOpened = false;
          go.swipe();
        };

        $rootScope.closeMenu = () => {
          self.closeMenu();
        };

        self.swipeRight = function () {
          if (!self.bSwipeSuspended) {
            self.openMenu();
          } else {
            console.log('ignoring swipe');
          }
        };

        self.suspendSwipe = function () {
          if (self.arrBalances.length <= 1) {
            return;
          }
          self.bSwipeSuspended = true;
          console.log('suspending swipe');
          $timeout(() => {
            self.bSwipeSuspended = false;
            console.log('resuming swipe');
          }, 100);
        };

        self.onQrCodeScanned = function (data) {
          go.handleUri(data);
        };

        self.openSendScreen = function () {
          go.send();
        };

        self.setUxLanguage = function () {
          const userLang = uxLanguage.update();
          self.defaultLanguageIsoCode = userLang;
          self.defaultLanguageName = uxLanguage.getName(userLang);
        };

        self.setAddressbook = function (ab) {
          if (ab) {
            self.addressbook = ab;
            return;
          }

          addressbookService.list((ab) => {
            self.addressbook = ab;
          });
        };

        function getNumberOfSelectedSigners() {
          let count = 1; // self
          self.copayers.forEach((copayer) => {
            if (copayer.signs) {
              count += 1;
            }
          });
          return count;
        }

        self.isEnoughSignersSelected = function () {
          if (self.m === self.n) {
            return true;
          }
          return (getNumberOfSelectedSigners() >= self.m);
        };

        self.getWallets = function () {
          return profileService.getWallets('livenet');
        };

        $rootScope.$on('Local/ClearHistory', (event) => {
          $log.debug('The wallet transaction history has been deleted', event);
          self.txHistory = [];
          self.completeHistory = [];
          self.updateHistory();
        });

        $rootScope.$on('Local/AddressbookUpdated', (event, ab) => {
          self.setAddressbook(ab);
        });

        // UX event handlers
        $rootScope.$on('Local/ColorUpdated', () => {
          self.updateColor();
          $timeout(() => {
            $rootScope.$apply();
          });
        });

        $rootScope.$on('Local/AliasUpdated', () => {
          self.updateAlias();
          $timeout(() => {
            $rootScope.$apply();
          });
        });

        $rootScope.$on('Local/SingleAddressFlagUpdated', () => {
          self.updateSingleAddressFlag();
          $timeout(() => {
            $rootScope.$apply();
          });
        });

        $rootScope.$on('Local/SpendUnconfirmedUpdated', () => {
          self.setSpendUnconfirmed();
          self.updateAll();
        });

        $rootScope.$on('Local/ProfileBound', () => {
        });

        $rootScope.$on('Local/NewFocusedWallet', () => {
          self.setUxLanguage();
        });

        $rootScope.$on('Local/LanguageSettingUpdated', () => {
          self.setUxLanguage();
        });

        $rootScope.$on('Local/UnitSettingUpdated', () => {
          breadcrumbs.add('UnitSettingUpdated');
          self.updateAll();
          self.updateTxHistory();
        });

        $rootScope.$on('Local/NeedFreshHistory', () => {
          breadcrumbs.add('NeedFreshHistory');
          self.updateHistory();
        });

        $rootScope.$on('Local/WalletCompleted', () => {
          self.setFocusedWallet();
          go.walletHome();
        });

        $rootScope.$on('Local/InitialRecoveryInProgress', () => {
          self.setOngoingProcess('recoveringFromSeed', true);
        });

        $rootScope.$on('Local/Resume', () => {
          $log.debug('### Resume event');
          const lightWallet = require('byteballcore/light_wallet.js');
          lightWallet.refreshLightClientHistory();
          // self.debouncedUpdate();
        });

        $rootScope.$on('Local/BackupDone', () => {
          $log.debug('Backup done');
          storageService.setBackupFlag('all', (err) => {
            if (err) {
              $log.warn(`setBackupFlag failed: ${JSON.stringify(err)}`);
              return;
            }
            self.needsBackup = false;
            $log.debug('Backup done stored');
          });
        });

        $rootScope.$on('Local/WalletImported', (event, walletId) => {
          self.needsBackup = false;
          storageService.setBackupFlag(walletId, () => {
            $log.debug('Backup done stored');
            addressService.expireAddress(walletId, (err) => {
              $log.debug('Expire address error', err);
              $timeout(() => {
                self.txHistory = [];
                self.completeHistory = [];
                self.startScan(walletId);
              }, 500);
            });
          });
        });

        $rootScope.$on('NewIncomingTx', () => {
          self.updateAll({
            walletStatus: null,
            untilItChanges: true,
            triggerTxUpdate: true
          });
        });

        $rootScope.$on('NewOutgoingTx', () => {
          breadcrumbs.add('NewOutgoingTx');
          self.updateAll({
            walletStatus: null,
            untilItChanges: true,
            triggerTxUpdate: true
          });
        });

        lodash.each(['NewTxProposal', 'TxProposalFinallyRejected', 'TxProposalRemoved', 'NewOutgoingTxByThirdParty',
          'Local/NewTxProposal', 'Local/TxProposalAction'
        ], (eventName) => {
          $rootScope.$on(eventName, (event, untilItChanges) => {
            self.updateAll({
              walletStatus: null,
              untilItChanges,
              triggerTxUpdate: true
            });
          });
        });

        $rootScope.$on('ScanFinished', () => {
          $log.debug('Scan Finished. Updating history');
          self.updateAll({
            walletStatus: null,
            triggerTxUpdate: true
          });
        });

        $rootScope.$on('Local/NoWallets', () => {
          $timeout(() => {
            self.hasProfile = true;
            self.noFocusedWallet = true;
            self.isComplete = null;
            self.walletName = null;
            go.path('import');
          });
        });

        $rootScope.$on('Local/NewFocusedWallet', () => {
          self.setFocusedWallet();
          self.updatingTxHistory = true;
          self.setOngoingProcess('updatingHistory', true);
          self.updateTxHistory();
          go.walletHome();
        });

        $rootScope.$on('Local/SetTab', (event, tab, reset) => {
          console.log(`SetTab ${tab}, reset ${reset}`);
          self.setTab(tab, reset);
        });

        $rootScope.$on('Local/RequestTouchid', (event, client, cb) => {
          fingerprintService.check(client, cb);
        });

        lodash.each(['NewCopayer', 'CopayerUpdated'], (eventName) => {
          $rootScope.$on(eventName, () => {
            // Re try to open wallet (will triggers)
            self.setFocusedWallet();
          });
        });

        $rootScope.$on('Local/NewEncryptionSetting', () => {
          const fc = profileService.focusedClient;
          self.isPrivKeyEncrypted = fc.isPrivKeyEncrypted();
          $timeout(() => {
            $rootScope.$apply();
          });
        });

        $rootScope.$on('Local/pushNotificationsReady', () => {
          self.usePushNotifications = true;
          $timeout(() => {
            $rootScope.$apply();
          });
        });

        $rootScope.$on('paymentRequest', (event, address, amount, asset, recipientDeviceAddress) => {
          console.log(`paymentRequest event ${address}, ${amount}`);
          $state.go('walletHome.send', {
            type: PaymentRequest.PAYMENT_REQUEST,
            address,
            amount,
            asset,
            recipientDeviceAddress
          });
          $rootScope.$emit('Local/SetTab', 'walletHome.send');
        });

        $rootScope.$on('merchantPaymentRequest', (event, address, amount, invoiceId, validForSeconds, merchantName, state) => {
          console.log(`merchantPaymentRequest event ${address}, ${amount}`);
          $state.go('walletHome.send', {
            type: PaymentRequest.MERCHANT_PAYMENT_REQUEST,
            address,
            amount,
            invoiceId,
            validForSeconds,
            merchantName,
            state
          });
          $rootScope.$emit('Local/SetTab', 'walletHome.send');
        });

        $rootScope.$on('paymentUri', (event, uri) => {
          $timeout(() => {
            $rootScope.$emit('Local/SetTab', 'walletHome.send');
            self.setForm(uri);
          }, 100);
        });


        if (autoRefreshClientService) {
          autoRefreshClientService.initHistoryAutoRefresh();
        }

        let gui;
        try {
          gui = require('nw.gui');
        } catch (e) {
          // continue regardless of error
        }
      });
}());
