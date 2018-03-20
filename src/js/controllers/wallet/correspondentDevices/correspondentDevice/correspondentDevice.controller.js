(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('CorrespondentDeviceCtrl', CorrespondentDeviceCtrl);

  CorrespondentDeviceCtrl.$inject = ['$scope', '$rootScope', '$timeout', '$modal', 'configService', 'profileService', 'animationService', 'Device', 'go',
    'correspondentListService', 'addressService', 'lodash', '$deepStateRedirect', '$state', 'backButton', 'connectionService', 'ENV', 'gettextCatalog'];

  function CorrespondentDeviceCtrl($scope, $rootScope, $timeout, $modal, configService, profileService, animationService, Device, go,
                                    correspondentListService, addressService, lodash, $deepStateRedirect, $state, backButton, connectionService, ENV, gettextCatalog) {
    const chatStorage = require('byteballcore/chat_storage.js');
    const device = require('byteballcore/device.js');
    const eventBus = require('byteballcore/event_bus.js');
    const storage = require('byteballcore/storage.js');
    const breadcrumbs = require('byteballcore/breadcrumbs.js');
    const network = require('byteballcore/network.js');
    const walletDefinedByKeys = require('byteballcore/wallet_defined_by_keys.js');

    const chatScope = $scope;
    const indexScope = $scope.index;
    const isCordova = Device.cordova;
    // todo: remove?
    // $scope.index.tab = 'chat';
    // $rootScope.tab = $scope.index.tab;
    $scope.backgroundColor = profileService.focusedClient.backgroundColor;
    const correspondent = correspondentListService.currentCorrespondent;
    $scope.correspondent = correspondent;
    if (document.chatForm && document.chatForm.message) {
      document.chatForm.message.focus();
    }

    if (!correspondentListService.messageEventsByCorrespondent[correspondent.device_address]) {
      correspondentListService.messageEventsByCorrespondent[correspondent.device_address] = [];
    }
    $scope.messageEvents = correspondentListService.messageEventsByCorrespondent[correspondent.device_address];

    $scope.$watch('correspondent.my_record_pref', (pref, oldPref) => {
      if (pref === oldPref) return;
      device.sendMessageToDevice(correspondent.device_address, 'chat_recording_pref', pref, {
        ifOk() {
          device.updateCorrespondentProps(correspondent);
          const oldState = (correspondent.peer_record_pref && !correspondent.my_record_pref);
          const newState = (correspondent.peer_record_pref && correspondent.my_record_pref);
          if (newState !== oldState) {
            const message = {
              type: 'system',
              message: JSON.stringify({ state: newState }),
              timestamp: Math.floor(Date.now() / 1000),
              chat_recording_status: true,
            };
            $scope.autoScrollEnabled = true;
            $scope.messageEvents.push(correspondentListService.parseMessage(message));
            $scope.$digest();
            chatStorage.store(correspondent.device_address, JSON.stringify({ state: newState }), 0, 'system');
          }
        },
        ifError() {
          // ignore
        },
      });
    });

    const removeNewMessagesDelim = function () {
      Object.keys($scope.messageEvents).forEach((i) => {
        if ($scope.messageEvents[i] && $scope.messageEvents[i].new_message_delim) {
          $scope.messageEvents.splice(i, 1);
        }
      });
    };

    $scope.$watch(`newMessagesCount['${correspondent.device_address}']`, () => {
      if (!$scope.newMsgCounterEnabled && $state.is('correspondentDevice')) {
        $scope.newMessagesCount[correspondent.device_address] = 0;
      }
    });

    $scope.$on('$stateChangeStart', (evt, toState) => {
      if (toState.name === 'correspondentDevice') {
        // todo: remove?
        // $scope.index.tab = 'chat';
        // $rootScope.tab = $scope.index.tab;
        $scope.newMessagesCount[correspondentListService.currentCorrespondent.device_address] = 0;
      } else {
        removeNewMessagesDelim();
      }
    });

    $scope.send = function () {
      $scope.error = null;
      if (!$scope.message) {
        return;
      }
      setOngoingProcess('sending');
      const message = lodash.clone($scope.message); // save in var as $scope.message may disappear while we are sending the message over the network
      device.sendMessageToDevice(correspondent.device_address, 'text', message, {
        ifOk() {
          setOngoingProcess();
          $scope.autoScrollEnabled = true;
          const msgObj = {
            bIncoming: false,
            message: correspondentListService.formatOutgoingMessage(message),
            timestamp: Math.floor(Date.now() / 1000),
          };
          correspondentListService.checkAndInsertDate($scope.messageEvents, msgObj);
          $scope.messageEvents.push(msgObj);
          $scope.message = '';
          $scope.$apply();
          if (correspondent.my_record_pref && correspondent.peer_record_pref) {
            chatStorage.store(correspondent.device_address, message, 0);
          }
        },
        ifError(error) {
          setOngoingProcess();
          const isHandled = connectionService.tryHandleError(error);
          if (!isHandled) {
            setError(error);
          }
        },
      });
    };

    $scope.insertMyAddress = function () {
      if (!profileService.focusedClient.credentials.isComplete()) {
        return $rootScope.$emit('Local/ShowErrorAlert', gettextCatalog.getString('The wallet is not approved yet'));
      }
      return readMyPaymentAddress(appendMyPaymentAddress);
    };

    $scope.requestPayment = function () {
      if (!profileService.focusedClient.credentials.isComplete()) {
        return $rootScope.$emit('Local/ShowErrorAlert', gettextCatalog.getString('The wallet is not approved yet'));
      }
      return readMyPaymentAddress(showRequestPaymentModal);
    };

    $scope.sendPayment = function (address, amount) {
      console.log(`will send payment to ${address}`);
      backButton.dontDeletePath = true;
      go.send(() => {
        // $rootScope.$emit('Local/SetTab', 'send', true);
        $rootScope.$emit('paymentRequest', address, amount, 'base', correspondent.device_address);
      });
    };

    $scope.showPayment = function (walletId, address) {
      const assetIndex = lodash.findIndex($scope.index.arrBalances, { asset: 'base' });
      if (assetIndex < 0) {
        throw Error(`failed to find asset index of asset ${'base'}`);
      }
      $scope.index.assetIndex = assetIndex;

      if (walletId && walletId !== indexScope.walletId) {
        return profileService.setAndStoreFocus(walletId, () => {
          $timeout(() => {
            go.walletHome();
          }, 500);
        });
      }

      if (address) {
        profileService.getWalletByAddress(address).then((wallet) => {
          if (wallet) {
            return profileService.setAndStoreFocus(wallet, () => {
              $timeout(() => {
                go.walletHome();
              }, 500);
            });
          }
        });
      }

      go.walletHome();
    };


    $scope.offerContract = function (address) {
      const walletDefinedByAddresses = require('byteballcore/wallet_defined_by_addresses.js');
      $rootScope.modalOpened = true;
      const fc = profileService.focusedClient;

      const ModalInstanceCtrl = function ($scopeModal, $modalInstance) {
        const config = configService.getSync();
        const configWallet = config.wallet;
        const walletSettings = configWallet.settings;
        $scopeModal.unitValue = walletSettings.unitValue;
        $scopeModal.unitName = walletSettings.unitName;
        $scopeModal.color = fc.backgroundColor;
        $scopeModal.bWorking = false;
        $scopeModal.arrRelations = ['=', '>', '<', '>=', '<=', '!='];
        $scopeModal.arrParties = [{ value: 'me', display_value: 'me' }, { value: 'peer', display_value: 'the peer' }];
        $scopeModal.arrPeerPaysTos = [{ value: 'me', display_value: 'me' }, {
          value: 'contract',
          display_value: 'this contract',
        }];
        $scopeModal.arrAssetInfos = indexScope.arrBalances.map((b) => {
          const infos = { asset: b.asset, is_private: b.is_private, displayName: walletSettings.unitName };
          return infos;
        });
        $scopeModal.arrPublicAssetInfos = $scopeModal.arrAssetInfos.filter(b => !b.is_private);
        const contract = {
          timeout: 4,
          myAsset: 'base',
          peerAsset: 'base',
          peer_pays_to: 'contract',
          relation: '>',
          expiry: 7,
          data_party: 'me',
          expiry_party: 'peer',
        };
        $scopeModal.contract = contract;


        $scopeModal.onDataPartyUpdated = function () {
          console.log('onDataPartyUpdated');
          contract.expiry_party = (contract.data_party === 'me') ? 'peer' : 'me';
        };

        $scopeModal.onExpiryPartyUpdated = function () {
          console.log('onExpiryPartyUpdated');
          contract.data_party = (contract.expiry_party === 'me') ? 'peer' : 'me';
        };


        $scopeModal.payAndOffer = function () {
          console.log('payAndOffer');
          $scopeModal.error = '';

          if (fc.isPrivKeyEncrypted()) {
            profileService.unlockFC(null, (err) => {
              if (err) {
                $scopeModal.error = err.message;
                $scopeModal.$apply();
                return;
              }
              $scopeModal.payAndOffer();
            });
            return;
          }

          profileService.requestTouchid(null, (err) => {
            if (err) {
              profileService.lockFC();
              $scopeModal.error = err;
              $timeout(() => {
                $scopeModal.$digest();
              }, 1);
              return null;
            }

            if ($scopeModal.bWorking) {
              return console.log('already working');
            }

            let myAmount = contract.myAmount;
            myAmount *= walletSettings.unitValue;
            myAmount = Math.round(myAmount);

            let peerAmount = contract.peerAmount;
            peerAmount *= walletSettings.unitValue;
            peerAmount = Math.round(peerAmount);

            if (myAmount === peerAmount && contract.myAsset === contract.peerAsset && contract.peer_pays_to === 'contract') {
              $scopeModal.error = gettextCatalog.getString(`The amounts are equal, you cannot require the peer to pay to the contract.
              Please either change the amounts slightly or fund the entire contract yourself and require the peer to pay his half to you.`);
              $timeout(() => {
                $scopeModal.$digest();
              }, 1);
              return null;
            }

            const fnReadMyAddress = (contract.peer_pays_to === 'contract') ? readMyPaymentAddress : issueNextAddress;
            fnReadMyAddress((myAddress) => {
              const arrSeenCondition = ['seen', {
                what: 'output',
                address: (contract.peer_pays_to === 'contract') ? 'this address' : myAddress,
                asset: contract.peerAsset,
                amount: peerAmount,
              }];
              readLastMainChainIndex((errorMci, lastMci) => {
                if (errorMci) {
                  $scopeModal.error = errorMci;
                  $timeout(() => {
                    $scopeModal.$digest();
                  }, 1);
                  return;
                }
                const arrEventCondition = ['in data feed', [[contract.oracle_address], contract.feed_name, contract.relation, `${contract.feed_value}`, lastMci]];
                const dataAddress = (contract.data_party === 'me') ? myAddress : address;
                const expiryAddress = (contract.expiry_party === 'me') ? myAddress : address;
                const dataDeviceAddress = (contract.data_party === 'me') ? device.getMyDeviceAddress() : correspondent.device_address;
                const expiryDeviceAddress = (contract.expiry_party === 'me') ? device.getMyDeviceAddress() : correspondent.device_address;
                const arrDefinition = ['or', [
                  ['and', [
                    arrSeenCondition,
                    ['or', [
                      ['and', [
                        ['address', dataAddress],
                        arrEventCondition,
                      ]],
                      ['and', [
                        ['address', expiryAddress],
                        ['in data feed', [[configService.TIMESTAMPER_ADDRESS], 'timestamp', '>', Date.now() + Math.round(contract.expiry * 24 * 3600 * 1000)]],
                      ]],
                    ]],
                  ]],
                  ['and', [
                    ['address', myAddress],
                    ['not', arrSeenCondition],
                    ['in data feed', [[configService.TIMESTAMPER_ADDRESS], 'timestamp', '>', Date.now() + Math.round(contract.timeout * 3600 * 1000)]],
                  ]],
                ]];
                const assocSignersByPath = {
                  'r.0.1.0.0': {
                    address: dataAddress,
                    member_signing_path: 'r',
                    device_address: dataDeviceAddress,
                  },
                  'r.0.1.1.0': {
                    address: expiryAddress,
                    member_signing_path: 'r',
                    device_address: expiryDeviceAddress,
                  },
                  'r.1.0': {
                    address: myAddress,
                    member_signing_path: 'r',
                    device_address: device.getMyDeviceAddress(),
                  },
                };
                walletDefinedByAddresses.createNewSharedAddress(arrDefinition, assocSignersByPath, {
                  ifError(errNsa) {
                    $scopeModal.bWorking = false;
                    $scopeModal.error = errNsa;
                    $timeout(() => {
                      $scopeModal.$digest();
                    });
                  },
                  ifOk(sharedAddress) {
                    composeAndSend(sharedAddress, arrDefinition, assocSignersByPath, myAddress);
                  },
                });
              });
            });

            // compose and send
            function composeAndSend(sharedAddress, arrDefinition, assocSignersByPath, myAddress) {
              let arrSigningDeviceAddresses = []; // empty list means that all signatures are required (such as 2-of-2)
              if (fc.credentials.m < fc.credentials.n) {
                indexScope.copayers.forEach((copayer) => {
                  if (copayer.me || copayer.signs) {
                    arrSigningDeviceAddresses.push(copayer.device_address);
                  }
                });
              } else if (indexScope.shared_address) {
                arrSigningDeviceAddresses = indexScope.copayers.map(copayer => copayer.device_address);
              }
              profileService.bKeepUnlocked = true;
              const opts = {
                shared_address: indexScope.shared_address,
                asset: contract.myAsset,
                to_address: sharedAddress,
                amount: myAmount,
                arrSigningDeviceAddresses,
                recipient_device_address: correspondent.device_address,
              };
              fc.sendMultiPayment(opts, (errSmp) => {
                // if multisig, it might take very long before the callback is called
                // self.setOngoingProcess();
                $scopeModal.bWorking = false;
                let errorMsg = errSmp;
                profileService.bKeepUnlocked = false;
                if (errorMsg) {
                  if (errorMsg.match(/device address/)) {
                    errorMsg = gettextCatalog.getString('This is a private asset, please send it only by clicking links from chat');
                  }
                  if (errorMsg.match(/no funded/)) {
                    errorMsg = gettextCatalog.getString('Not enough confirmed funds');
                  }
                  if ($scopeModal) {
                    $scopeModal.error = errorMsg;
                  }
                  return;
                }
                $rootScope.$emit('NewOutgoingTx');
                eventBus.emit('sent_payment', correspondent.device_address, myAmount, contract.myAsset, indexScope.walletId);
                let paymentRequestCode;
                if (contract.peer_pays_to === 'contract') {
                  const arrPayments = [{ address: sharedAddress, amount: peerAmount, asset: contract.peerAsset }];
                  const assocDefinitions = {};
                  assocDefinitions[sharedAddress] = {
                    definition: arrDefinition,
                    signers: assocSignersByPath,
                  };
                  const objPaymentRequest = { payments: arrPayments, definitions: assocDefinitions };
                  const paymentJson = JSON.stringify(objPaymentRequest);
                  const paymentJsonBase64 = new Buffer(paymentJson).toString('base64');
                  paymentRequestCode = `payment:${paymentJsonBase64}`;
                } else {
                  paymentRequestCode = `dagcoin:${myAddress}?amount=${peerAmount}&asset=${encodeURIComponent(contract.peerAsset)}`;
                }
                const paymentRequestText = gettextCatalog.getString(`[your share of payment to the contract](${paymentRequestCode})`);
                device.sendMessageToDevice(correspondent.device_address, 'text', paymentRequestText);
                correspondentListService.messageEventsByCorrespondent[correspondent.device_address].push({
                  bIncoming: false,
                  message: correspondentListService.formatOutgoingMessage(paymentRequestText),
                });
                if (contract.peer_pays_to === 'me') {
                  issueNextAddress();
                } // make sure the address is not reused
              });
              $modalInstance.dismiss('cancel');
            }
            return null;
          });
        }; // payAndOffer


        $scopeModal.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
      };

      const modalInstance = $modal.open({
        templateUrl: 'views/modals/offer-contract.html',
        windowClass: animationService.modalAnimated.slideUp,
        controller: ['$scope', '$modalInstance', ModalInstanceCtrl],
        scope: $scope,
      });

      const disableCloseModal = $rootScope.$on('closeModal', () => {
        modalInstance.dismiss('cancel');
      });

      modalInstance.result.finally(() => {
        $rootScope.modalOpened = false;
        disableCloseModal();
        const m = angular.element(document.getElementsByClassName('reveal-modal'));
        m.addClass(animationService.modalAnimated.slideOutDown);
      });
    };


    $scope.sendMultiPayment = function (paymentJsonBase64) {
      const async = require('async');
      const db = require('byteballcore/db.js');
      const walletDefinedByAddresses = require('byteballcore/wallet_defined_by_addresses.js');
      const paymentJson = new Buffer(paymentJsonBase64, 'base64').toString('utf8');
      console.log(`multi ${paymentJson}`);
      const objMultiPaymentRequest = JSON.parse(paymentJson);
      $rootScope.modalOpened = true;
      const fc = profileService.focusedClient;
      const ModalInstanceCtrl = function ($scopeModal, $modalInstance) {
        const config = configService.getSync();
        const configWallet = config.wallet;
        const walletSettings = configWallet.settings;
        $scopeModal.unitValue = walletSettings.unitValue;
        $scopeModal.unitName = walletSettings.unitName;
        $scopeModal.color = fc.backgroundColor;
        $scopeModal.bDisabled = true;
        const assocSharedDestinationAddresses = {};
        const createMovementLines = function () {
          $scopeModal.arrMovements = objMultiPaymentRequest.payments.map((objPayment) => {
            let text = `${correspondentListService.getAmountText(objPayment.amount)} to ${objPayment.address}`;
            if (assocSharedDestinationAddresses[objPayment.address]) {
              text += ' (smart address, see below)';
            }
            return text;
          });
        };
        if (objMultiPaymentRequest.definitions) {
          let arrAllMemberAddresses = [];
          const arrFuncs = [];
          const assocMemberAddressesByDestAddress = {};
          Object.keys(objMultiPaymentRequest.definitions).forEach((destinationAddress) => {
            const ad = objMultiPaymentRequest.definitions[destinationAddress].definition;
            const arrMemberAddresses = extractAddressesFromDefinition(ad);
            assocMemberAddressesByDestAddress[destinationAddress] = arrMemberAddresses;
            arrAllMemberAddresses = arrAllMemberAddresses.concat(arrMemberAddresses);
            arrFuncs.push((cb) => {
              walletDefinedByAddresses.validateAddressDefinition(ad, cb);
            });
          });
          arrAllMemberAddresses = lodash.uniq(arrAllMemberAddresses);
          if (arrAllMemberAddresses.length === 0) {
            throw Error(gettextCatalog.getString(`no member addresses in ${paymentJson}`));
          }
          const findMyAddresses = function (cb) {
            db.query(
              'SELECT address FROM my_addresses WHERE address IN(?) \n\ ' +
              'UNION \n\ ' +
              'SELECT shared_address AS address FROM shared_addresses WHERE shared_address IN(?)',
              [arrAllMemberAddresses, arrAllMemberAddresses],
              (rows) => {
                const arrMyAddresses = rows.map(row => row.address);
                Object.keys(assocMemberAddressesByDestAddress).forEach((destinationAddress) => {
                  const arrMemberAddresses = assocMemberAddressesByDestAddress[destinationAddress];
                  if (lodash.intersection(arrMemberAddresses, arrMyAddresses).length > 0) {
                    assocSharedDestinationAddresses[destinationAddress] = true;
                  }
                });
                createMovementLines();
                $scopeModal.arrHumanReadableDefinitions = [];
                Object.keys(objMultiPaymentRequest.definitions).forEach((da) => {
                  const arrDef = objMultiPaymentRequest.definitions[da].definition;
                  $scopeModal.arrHumanReadableDefinitions.push({
                    destinationAddress: da,
                    humanReadableDefinition: correspondentListService.getHumanReadableDefinition(arrDef, arrMyAddresses, []),
                  });
                });
                cb();
              });
          };
          arrFuncs.push(findMyAddresses);
          async.series(arrFuncs, (err) => {
            if (err) {
              $scopeModal.error = err;
            } else {
              $scopeModal.bDisabled = false;
            }
            $scopeModal.$apply();
          });
        } else {
          $scopeModal.bDisabled = false;
        }

        function insertSharedAddress(sharedAddress, arrDefinitionSa, signers, cb) {
          db.query('SELECT 1 FROM shared_addresses WHERE shared_address=?', [sharedAddress], (rows) => {
            if (rows.length > 0) {
              console.log(`shared address ${sharedAddress} already known`);
              return cb();
            }
            return walletDefinedByAddresses.handleNewSharedAddress({
              address: sharedAddress,
              definition: arrDefinitionSa,
              signers,
            }, {
              ifOk: cb,
              ifError(err) {
                throw Error(gettextCatalog.getString(`failed to create shared address ${sharedAddress}: ${err}`));
              },
            });
          });
        }


        $scopeModal.pay = function () {
          console.log('pay');

          if (fc.isPrivKeyEncrypted()) {
            profileService.unlockFC(null, (err) => {
              if (err) {
                $scopeModal.error = err.message;
                $scopeModal.$apply();
                return;
              }
              $scopeModal.pay();
            });
            return;
          }

          profileService.requestTouchid(null, (err) => {
            if (err) {
              profileService.lockFC();
              $scopeModal.error = err;
              $timeout(() => {
                $scopeModal.$digest();
              }, 1);
              return;
            }

            // create shared addresses
            const arrFuncs = [];
            Object.keys(assocSharedDestinationAddresses).forEach((destinationAddress) => {
              (function () { // use self-invoking function to isolate scope of da and make it different in different iterations
                const da = destinationAddress;
                arrFuncs.push((cb) => {
                  const objDefinitionAndSigners = objMultiPaymentRequest.definitions[da];
                  insertSharedAddress(da, objDefinitionAndSigners.definition, objDefinitionAndSigners.signers, cb);
                });
              }());
            });
            async.series(arrFuncs, () => {
              // shared addresses inserted, now pay
              const arrBaseOutputs = [];
              objMultiPaymentRequest.payments.forEach((objPayment) => {
                arrBaseOutputs.push({ address: objPayment.address, amount: objPayment.amount });
              });
              let arrSigningDeviceAddresses = []; // empty list means that all signatures are required (such as 2-of-2)
              if (fc.credentials.m < fc.credentials.n) {
                indexScope.copayers.forEach((copayer) => {
                  if (copayer.me || copayer.signs) {
                    arrSigningDeviceAddresses.push(copayer.device_address);
                  }
                });
              } else if (indexScope.shared_address) {
                arrSigningDeviceAddresses = indexScope.copayers.map(copayer => copayer.device_address);
              }
              const currentMultiPaymentKey = require('crypto').createHash('sha256').update(paymentJson).digest('base64');
              if (currentMultiPaymentKey === indexScope.current_multi_payment_key) {
                $rootScope.$emit('Local/ShowErrorAlert', gettextCatalog.getString('This payment is already under way'));
                $modalInstance.dismiss('cancel');
                return;
              }
              indexScope.current_multi_payment_key = currentMultiPaymentKey;
              const recipientDeviceAddress = lodash.clone(correspondent.device_address);
              fc.sendMultiPayment({
                asset: 'base',
                arrSigningDeviceAddresses,
                recipient_device_address: recipientDeviceAddress,
                base_outputs: arrBaseOutputs,
                asset_outputs: arrBaseOutputs,
              }, (errSmp) => { // can take long if multisig
                delete indexScope.current_multi_payment_key;
                if (errSmp) {
                  if (chatScope) {
                    setError(errSmp);
                    chatScope.$apply();
                  }
                  return;
                }
                $rootScope.$emit('NewOutgoingTx');
                const assocPayments = correspondentListService.getPayments(objMultiPaymentRequest);
                eventBus.emit('sent_payment', recipientDeviceAddress, assocPayments, 'base', indexScope.walletId);
              });
              $modalInstance.dismiss('cancel');
            });
          });
        }; // pay


        $scopeModal.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
      };

      function extractAddressesFromDefinition(arrDefinition) {
        const assocAddresses = {};

        function parse(arrSubdefinition) {
          const op = arrSubdefinition[0];
          switch (op) {
            case 'address':
            case 'cosigned by':
              assocAddresses[arrSubdefinition[1]] = true;
              break;
            case 'or':
            case 'and':
              arrSubdefinition[1].forEach(parse);
              break;
            case 'r of set':
              arrSubdefinition[1].set.forEach(parse);
              break;
            case 'weighted and':
              arrSubdefinition[1].set.forEach((arg) => {
                parse(arg.value);
              });
              break;
            default:
              break;
          }
        }

        parse(arrDefinition);
        return Object.keys(assocAddresses);
      }

      const modalInstance = $modal.open({
        templateUrl: 'views/modals/multi-payment.html',
        windowClass: animationService.modalAnimated.slideUp,
        controller: ['$scope', '$modalInstance', ModalInstanceCtrl],
        scope: $scope,
      });

      const disableCloseModal = $rootScope.$on('closeModal', () => {
        modalInstance.dismiss('cancel');
      });

      modalInstance.result.finally(() => {
        $rootScope.modalOpened = false;
        disableCloseModal();
        const m = angular.element(document.getElementsByClassName('reveal-modal'));
        m.addClass(animationService.modalAnimated.slideOutDown);
      });
    };


    // send a command to the bot
    $scope.sendCommand = function (command) {
      console.log(`will send command ${command}`);
      $scope.message = command;
      $scope.send();
    };

    $scope.openExternalLink = function (url) {
      if (typeof nw !== 'undefined') {
        nw.Shell.openExternal(url);
      } else if (isCordova) {
        cordova.InAppBrowser.open(url, '_system');
      }
    };

    $scope.editCorrespondent = function () {
      go.path('editCorrespondentDevice');
    };

    $scope.loadMoreHistory = function (cb) {
      correspondentListService.loadMoreHistory(correspondent, cb);
    };

    $scope.autoScrollEnabled = true;
    $scope.loadMoreHistory(() => {
      let message;
      Object.keys($scope.messageEvents).forEach((i) => {
        if (!message || !message.chat_recording_status) {
          message = $scope.messageEvents[i];
        }
      });
      if (message && message.chat_recording_status) {
        return;
      }
      breadcrumbs.add(`correspondent with empty chat opened: ${correspondent.device_address}`);
      message = {
        type: 'system',
        bIncoming: false,
        message: JSON.stringify({ state: (!!(correspondent.peer_record_pref && correspondent.my_record_pref)) }),
        timestamp: Math.floor(+new Date() / 1000),
        chat_recording_status: true,
      };
      chatStorage.store(correspondent.device_address, message.message, 0, 'system');
      $scope.messageEvents.push(correspondentListService.parseMessage(message));
    });

    function setError(error) {
      console.log('send error:', error);
      $scope.error = error;
    }

    function readLastMainChainIndex(cb) {
      const conf = require('byteballcore/conf.js');
      if (conf.bLight) {
        network.requestFromLightVendor('get_last_mci', null, (ws, request, responseFlv) => {
          if (responseFlv.error) {
            cb(responseFlv.error);
          } else {
            cb(null, responseFlv);
          }
        });
      } else {
        storage.readLastMainChainIndex((lastMci) => {
          cb(null, lastMci);
        });
      }
    }

    function readMyPaymentAddress(cb) {
      if (indexScope.shared_address) {
        return cb(indexScope.shared_address);
      }
      addressService.getAddress(profileService.focusedClient.credentials.walletId, false, (err, address) => cb(address));
      return null;
    }

    function issueNextAddress(cb) {
      walletDefinedByKeys.issueNextAddress(profileService.focusedClient.credentials.walletId, 0, (addressInfo) => {
        if (cb) {
          cb(addressInfo.address);
        }
      });
    }

    function appendText(text) {
      const msgField = document.getElementById('message');

      let messageText = !$scope.message ? '' : $scope.message;
      if ($scope.message && $scope.message.charAt($scope.message.length - 1) !== ' ') {
        messageText += ' ';
      }
      messageText += text;
      messageText += ' ';
      $scope.message = messageText;

      if (!msgField) { // already gone
        return;
      }

      msgField.focus();
      msgField.selectionEnd = msgField.value.length;
      msgField.selectionStart = msgField.selectionEnd;
      msgField.value = messageText;
    }

    function appendMyPaymentAddress(myPaymentAddress) {
      appendText(myPaymentAddress);
    }

    function showRequestPaymentModal(myPaymentAddress) {
      $rootScope.modalOpened = true;
      const fc = profileService.focusedClient;
      const ModalInstanceCtrl = function ($scopeModal, $modalInstance) {
        const config = configService.getSync();
        const configWallet = config.wallet;
        const walletSettings = configWallet.settings;
        $scopeModal.unitValue = walletSettings.unitValue;
        $scopeModal.unitName = walletSettings.unitName;
        $scopeModal.color = fc.backgroundColor;
        $scopeModal.isCordova = isCordova;
        $scopeModal.buttonLabel = gettextCatalog.getString('Request payment');

        Object.defineProperty($scopeModal,
          '_customAmount', {
            get() {
              return $scopeModal.customAmount;
            },
            set(newValue) {
              $scopeModal.customAmount = newValue;
            },
            enumerable: true,
            configurable: true,
          });

        $scopeModal.submitForm = function (form) {
          if ($scopeModal.index.arrBalances.length === 0) {
            return console.log('showRequestPaymentModal: no balances yet');
          }
          const amount = form.amount.$modelValue;
          const amountInSmallestUnits = amount * $scopeModal.unitValue;
          const params = `amount=${amountInSmallestUnits}`;

          const units = $scopeModal.unitName;

          appendText(`[${amount} ${units}](Dagcoin:${myPaymentAddress}?${params})`);

          return $modalInstance.dismiss('cancel');
        };

        $scopeModal.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
      };

      const modalInstance = $modal.open({
        templateUrl: 'views/modals/customized-amount.html',
        windowClass: animationService.modalAnimated.slideUp,
        controller: ['$scope', '$modalInstance', ModalInstanceCtrl],
        scope: $scope,
      });

      const disableCloseModal = $rootScope.$on('closeModal', () => {
        modalInstance.dismiss('cancel');
      });

      modalInstance.result.finally(() => {
        $rootScope.modalOpened = false;
        disableCloseModal();
        const m = angular.element(document.getElementsByClassName('reveal-modal'));
        m.addClass(animationService.modalAnimated.slideOutDown);
      });
    }

    function setOngoingProcess(name) {
      if (isCordova) {
        if (name) {
          window.plugins.spinnerDialog.hide();
          window.plugins.spinnerDialog.show(null, `${name}...`, true);
        } else {
          window.plugins.spinnerDialog.hide();
        }
      } else {
        $scope.onGoingProcess = name;
        $timeout(() => {
          $rootScope.$apply();
        });
      }
    }

    $scope.goToCorrespondentDevices = function () {
      if ($rootScope.goBackState) {
        go.path($rootScope.goBackState);
      } else {
        $deepStateRedirect.reset('wallet.correspondentDevices');
        go.path('wallet.correspondentDevices');
      }
    };
  }
})();

