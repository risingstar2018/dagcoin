/* eslint-disable radix,no-nested-ternary,no-shadow,no-plusplus,consistent-return,no-underscore-dangle,no-unused-vars,no-use-before-define,comma-dangle */
(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('SendCtrl', SendCtrl);

  SendCtrl.$inject = ['$scope', '$rootScope', '$location', '$anchorScroll', '$timeout', '$log', 'lodash', 'go', 'profileService',
    'configService', 'addressService', 'addressbookService', 'animationService', 'gettextCatalog', 'derivationPathHelper',
    'correspondentListService', 'utilityService', 'transactionsService', 'ENV', '$modal', '$state'];

  function SendCtrl($scope, $rootScope, $location, $anchorScroll, $timeout, $log, lodash, go, profileService,
                    configService, addressService, addressbookService, animationService, gettextCatalog, derivationPathHelper,
                    correspondentListService, utilityService, transactionsService, ENV, $modal, $state) {
    const breadcrumbs = require('byteballcore/breadcrumbs.js');
    const eventBus = require('byteballcore/event_bus.js');

    // TODO indexScope is called just for getting available amount. This should not be done like that.
    const indexScope = $scope.index;
    const config = configService.getSync();
    const configWallet = config.wallet;
    const vm = this;

    // INIT
    const walletSettings = configWallet.settings;
    vm.unitValue = walletSettings.unitValue;
    vm.unitName = walletSettings.unitName;
    vm.unitDecimals = walletSettings.unitDecimals;

    const assocDeviceAddressesByPaymentAddress = {};

    $scope.currentSpendUnconfirmed = configWallet.spendUnconfirmed;

    const viewContentLoaded = function () {
      $scope.sendForm.$setPristine();
      vm.resetForm(() => {
        if ($rootScope.sendParams) {
          if ($rootScope.sendParams.amount) {
            $scope._amount = $rootScope.sendParams.amount;
          }
          if ($rootScope.sendParams.address) {
            $scope._address = $rootScope.sendParams.address;
          }
          delete $rootScope.sendParams;
        }
      });
      if (profileService.focusedClient) {
        vm.setSendFormInputs();
      }
    };

    const destroy = () => {
      console.log('send controller $destroy');
      $rootScope.hideMenuBar = false;
    };

    vm.resetError = function () {
      vm.error = null;
      vm.success = null;
    };

    vm.onAddressChange = function (value) {
      vm.resetError();
      return !value ? '' : value;
    };

    vm.setSendFormInputs = function () {
      /**
       * Setting the two related amounts as properties prevents an infinite
       * recursion for watches while preserving the original angular updates
       *
       */
      Object.defineProperty($scope,
        '_amount', {
          get() {
            return $scope.__amount;
          },
          set(newValue) {
            $scope.__amount = newValue;
            vm.resetError();
          },
          enumerable: true,
          configurable: true
        });

      Object.defineProperty($scope,
        '_address', {
          get() {
            return $scope.__address;
          },
          set(newValue) {
            $scope.__address = vm.onAddressChange(newValue);
            if ($scope.sendForm && $scope.sendForm.address.$valid) {
              vm.lockAddress = true;
            }
          },
          enumerable: true,
          configurable: true,
        });

      // ToDo: use a credential's (or fc's) function for this
      vm.hideNote = true;
    };

    vm.setForm = function (to, amount, comment, asset, recipientDeviceAddress) {
      vm.resetError();
      delete vm.binding;
      const form = $scope.sendForm;
      let moneyAmount = amount;
      if (!form || !form.address) {
        // disappeared?
        return console.log('form.address has disappeared');
      }
      if (to) {
        form.address.$setViewValue(to);
        form.address.$isValid = true;
        form.address.$render();
        this.lockAddress = true;
        if (recipientDeviceAddress) {
          // must be already paired
          assocDeviceAddressesByPaymentAddress[to] = recipientDeviceAddress;
        }
      } else {
        this.lockAddress = false;
      }

      if (moneyAmount) {
        moneyAmount /= this.unitValue;
        this.lockAmount = true;
        $timeout(() => {
          form.amount.$setViewValue(`${moneyAmount}`);
          form.amount.$isValid = true;
          form.amount.$render();

          form.address.$setViewValue(to);
          form.address.$isValid = true;
          form.address.$render();
        }, 300);
      } else {
        this.lockAmount = false;
        form.amount.$pristine = true;
        form.amount.$render();
      }

      if (form.merkle_proof) {
        form.merkle_proof.$setViewValue('');
        form.merkle_proof.$render();
      }
      if (comment) {
        form.comment.$setViewValue(comment);
        form.comment.$isValid = true;
        form.comment.$render();
      }

      if (asset) {
        const assetIndex = lodash.findIndex($scope.index.arrBalances, { asset });
        if (assetIndex < 0) {
          throw Error(gettextCatalog.getString(`failed to find asset index of asset ${asset}`));
        }
        $scope.index.assetIndex = assetIndex;
        this.lockAsset = true;
      } else {
        this.lockAsset = false;
      }
    };

    vm.resetForm = function (cb) {
      vm.resetError();
      delete vm.binding;

      const invoiceId = vm.invoiceId;

      const options = {
        uri: `${ENV.MERCHANT_INTEGRATION_API}/cancel`,
        method: 'POST',
        json: {
          invoiceId
        }
      };

      if (invoiceId !== null) {
        const request = require('request');
        request(options, (error, response, body) => {
          if (error) {
            console.log(`CANCEL ERROR: ${error}`);
          }
          console.log(`RESPONSE: ${JSON.stringify(response)}`);
          console.log(`BODY: ${JSON.stringify(body)}`);
        });
      }

      vm.invoiceId = null;
      vm.validForSeconds = null;
      vm.lockAsset = false;
      vm.lockAddress = false;
      vm.lockAmount = false;
      vm.hideAdvSend = true;
      $scope.currentSpendUnconfirmed = configService.getSync().wallet.spendUnconfirmed;

      vm._amount = null;
      vm._address = null;
      vm.bSendAll = false;

      const form = $scope.sendForm;

      if (form && form.amount) {
        form.amount.$pristine = true;
        form.amount.$setViewValue('');
        if (form.amount) {
          form.amount.$render();
        }

        if (form.merkle_proof) {
          form.merkle_proof.$setViewValue('');
          form.merkle_proof.$render();
        }
        if (form.comment) {
          form.comment.$setViewValue('');
          form.comment.$render();
        }
        form.$setPristine();

        if (form.address) {
          form.address.$pristine = true;
          form.address.$setViewValue('');
          form.address.$render();
        }
      }
      $timeout(() => {
        if (cb) {
          cb();
        }
        $rootScope.$digest();
      }, 1);
    };

    vm.setSendAll = () => {
      const form = $scope.sendForm;
      if (!form || !form.amount || indexScope.arrBalances.length === 0) {
        return;
      }
      let available = indexScope.baseBalance.stable;
      available /= vm.unitValue;
      form.amount.$setViewValue(`${available}`);
      form.amount.$render();
    };

    vm.openDestinationAddressModal = function (wallets, address) {
      $rootScope.modalOpened = true;
      const fc = profileService.focusedClient;

      const ModalInstanceCtrl = function ($scope, $modalInstance) {
        $scope.wallets = wallets;
        $scope.isMultiWallet = wallets.length > 0;
        $scope.selectedAddressbook = {};
        $scope.newAddress = address;
        $scope.addressbook = {
          address: ($scope.newAddress || ''),
          label: '',
        };
        $scope.color = fc.backgroundColor;
        $scope.bAllowAddressbook = vm.canSendExternalPayment();
        $scope.selectedWalletsOpt = !!(wallets[0] || !$scope.bAllowAddressbook);

        $scope.selectAddressbook = function (addr) {
          $modalInstance.close(addr);
        };

        $scope.setWalletsOpt = function () {
          $scope.selectedWalletsOpt = !$scope.selectedWalletsOpt;
        };

        $scope.listEntries = function () {
          $scope.error = null;
          addressbookService.list((ab) => {
            const sortedContactArray = lodash.sortBy(ab, (contact) => {
              const favoriteCharacter = contact.favorite === true ? '!' : '';
              const fullName = `${contact.first_name}${contact.last_name}`.toUpperCase();
              return `${favoriteCharacter}${fullName}`;
            });
            $scope.list = {};
            lodash.forEach(sortedContactArray, (contact) => {
              $scope.list[contact.address] = contact;
            });
          });
        };

        $scope.$watch('addressbook.label', (value) => {
          if (value && value.length > 16) {
            $scope.addressbook.label = value.substr(0, 16);
          }
        });

        $scope.cancel = function () {
          breadcrumbs.add('openDestinationAddressModal cancel');
          $modalInstance.dismiss('cancel');
        };

        $scope.selectWallet = function (walletId, walletName) {
          $scope.selectedWalletName = walletName;
          addressService.getAddress(walletId, false, (err, addr) => {
            $scope.gettingAddress = false;

            if (err) {
              vm.error = err;
              breadcrumbs.add(`openDestinationAddressModal getAddress err: ${err}`);
              $modalInstance.dismiss('cancel');
              return;
            }

            $modalInstance.close(addr);
          });
        };
      };

      const modalInstance = $modal.open({
        templateUrl: 'views/modals/destination-address.html',
        windowClass: animationService.modalAnimated.slideUp,
        controller: ModalInstanceCtrl,
      });

      const disableCloseModal = $rootScope.$on('closeModal', () => {
        breadcrumbs.add('openDestinationAddressModal on closeModal');
        modalInstance.dismiss('cancel');
      });

      modalInstance.result.finally(() => {
        $rootScope.modalOpened = false;
        disableCloseModal();
        const m = angular.element(document.getElementsByClassName('reveal-modal'));
        m.addClass(animationService.modalAnimated.slideOutDown);
      });

      modalInstance.result.then((addr) => {
        if (addr) {
          vm.setToAddress(addr);
        }
      });
    };

    vm.canSendExternalPayment = function () {
      if ($scope.index.arrBalances.length === 0) {
        // no balances yet, assume can send
        return true;
      }
      if (!$scope.index.arrBalances[$scope.index.assetIndex].is_private) {
        return true;
      }
      const form = $scope.sendForm;
      if (!form || !form.address) {
        // disappeared
        return true;
      }
      const address = form.address.$modelValue;
      const recipientDeviceAddress = assocDeviceAddressesByPaymentAddress[address];
      return !!recipientDeviceAddress;
    };

    vm.deviceAddressIsKnown = function () {
      if ($scope.index.arrBalances.length === 0) {
        // no balances yet
        return false;
      }
      const form = $scope.sendForm;
      if (!form || !form.address) {
        // disappeared
        return false;
      }
      const address = form.address.$modelValue;
      const recipientDeviceAddress = assocDeviceAddressesByPaymentAddress[address];
      return !!recipientDeviceAddress;
    };

    vm.setToAddress = function (to) {
      const form = $scope.sendForm;
      if (!form || !form.address) {
        // disappeared?
        return console.log('form.address has disappeared');
      }
      form.address.$setViewValue(to);
      form.address.$isValid = true;
      form.address.$render();
      vm.lockAddress = true;
    };

    vm.setSendError = function (err) {
      const fc = profileService.focusedClient;
      const prefix = fc.credentials.m > 1 ?
        gettextCatalog.getString('Could not create payment proposal') :
        gettextCatalog.getString('Could not send payment');

      vm.error = `${prefix}: ${err}`;
      console.log(this.error);

      $timeout(() => {
        $scope.$digest();
      }, 1);
    };

    /**
     * Invoked when SEND button clicked
     * @return {*}
     */
    vm.submitForm = function () {
      if ($scope.index.arrBalances.length === 0) {
        vm.setSendError(gettextCatalog('no balances yet'));
        return console.log('send payment: no balances yet');
      }
      const fc = profileService.focusedClient;
      const unitValue = vm.unitValue;

      // TODO sinan ?? should be removed? used neither in class nor in html files
      if (utilityService.isCordova) {
        this.hideAddress = false;
        this.hideAmount = false;
      }

      const form = $scope.sendForm;
      if (!form) {
        return console.log('form is gone');
      }
      if (form.$invalid) {
        // TODO sinan why setSendError not used
        vm.error = gettextCatalog.getString('Unable to send transaction proposal');
        return;
      }
      if (fc.isPrivKeyEncrypted()) {
        profileService.unlockFC(null, (err) => {
          if (err) {
            return vm.setSendError(err.message);
          }
          return vm.submitForm();
        });
        return;
      }

      const asset = 'base';
      console.log(`asset ${asset}`);
      const address = form.address.$modelValue;
      const recipientDeviceAddress = assocDeviceAddressesByPaymentAddress[address];
      let amount = form.amount.$modelValue;
      const invoiceId = vm.invoiceId;
      // const paymentId = 1;
      let merkleProof = '';
      if (form.merkle_proof && form.merkle_proof.$modelValue) {
        merkleProof = form.merkle_proof.$modelValue.trim();
      }
      amount *= unitValue;
      amount = Math.round(amount);

      const currentPaymentKey = `${asset}${address}${amount}`;
      if (currentPaymentKey === vm.current_payment_key) {
        return $rootScope.$emit('Local/ShowErrorAlert', 'This payment is being processed');
      }
      vm.current_payment_key = currentPaymentKey;

      indexScope.setOngoingProcess(gettextCatalog.getString('sending'), true);
      $timeout(() => {
        profileService.requestTouchid(null, (err) => {
          if (err) {
            profileService.lockFC();
            indexScope.setOngoingProcess(gettextCatalog.getString('sending'), false);
            vm.error = err;
            $timeout(() => {
              delete vm.current_payment_key;
              $scope.$digest();
            }, 1);
            return;
          }
          let myAddress;
          const device = require('byteballcore/device.js');
          const walletDefinedByKeys = require('byteballcore/wallet_defined_by_keys.js');
          if (vm.binding) {
            if (!recipientDeviceAddress) {
              throw Error(gettextCatalog.getString('recipient device address not known'));
            }
            const walletDefinedByAddresses = require('byteballcore/wallet_defined_by_addresses.js');

            // never reuse addresses as the required output could be already present
            walletDefinedByKeys.issueNextAddress(fc.credentials.walletId, 0, (addressInfo) => {
              myAddress = addressInfo.address;
              let arrDefinition;
              let assocSignersByPath;
              if (vm.binding.type === 'reverse_payment') {
                const arrSeenCondition = ['seen', {
                  what: 'output',
                  address: myAddress,
                  asset: 'base',
                  amount: vm.binding.reverseAmount,
                }];
                arrDefinition = ['or', [
                  ['and', [
                    ['address', address],
                    arrSeenCondition,
                  ]],
                  ['and', [
                    ['address', myAddress],
                    ['not', arrSeenCondition],
                    ['in data feed', [[ENV.TIMESTAMPER_ADDRESS], 'timestamp', '>', Date.now() + Math.round(vm.binding.timeout * 3600 * 1000)]],
                  ]],
                ]];
                assocSignersByPath = {
                  'r.0.0': {
                    address,
                    member_signing_path: 'r',
                    device_address: recipientDeviceAddress,
                  },
                  'r.1.0': {
                    address: myAddress,
                    member_signing_path: 'r',
                    device_address: device.getMyDeviceAddress(),
                  },
                };
              } else {
                const arrExplicitEventCondition = ['in data feed', [[vm.binding.oracle_address], vm.binding.feed_name, '=', vm.binding.feed_value]];
                const arrMerkleEventCondition = ['in merkle', [[vm.binding.oracle_address], vm.binding.feed_name, vm.binding.feed_value]];
                let arrEventCondition;
                if (vm.binding.feed_type === 'explicit') {
                  arrEventCondition = arrExplicitEventCondition;
                } else if (vm.binding.feed_type === 'merkle') {
                  arrEventCondition = arrMerkleEventCondition;
                } else if (vm.binding.feed_type === 'either') {
                  arrEventCondition = ['or', [arrMerkleEventCondition, arrExplicitEventCondition]];
                } else {
                  throw Error(`unknown feed type: ${vm.binding.feed_type}`);
                }
                arrDefinition = ['or', [
                  ['and', [['address', address], arrEventCondition]],
                  ['and', [
                    ['address', myAddress], ['in data feed', [[ENV.TIMESTAMPER_ADDRESS], 'timestamp', '>', Date.now() + Math.round(vm.binding.timeout * 3600 * 1000)]]
                  ]]
                ]];
                assocSignersByPath = {
                  'r.0.0': {
                    address,
                    member_signing_path: 'r',
                    device_address: recipientDeviceAddress,
                  },
                  'r.1.0': {
                    address: myAddress,
                    member_signing_path: 'r',
                    device_address: device.getMyDeviceAddress(),
                  },
                };
                if (vm.binding.feed_type === 'merkle' || vm.binding.feed_type === 'either') {
                  assocSignersByPath[(vm.binding.feed_type === 'merkle') ? 'r.0.1' : 'r.0.1.0'] = {
                    address: '',
                    member_signing_path: 'r',
                    device_address: recipientDeviceAddress,
                  };
                }
              }
              walletDefinedByAddresses.createNewSharedAddress(arrDefinition, assocSignersByPath, {
                ifError(err) {
                  delete vm.current_payment_key;
                  indexScope.setOngoingProcess(gettextCatalog.getString('sending'), false);
                  vm.setSendError(err);
                },
                ifOk(sharedAddress) {
                  composeAndSend(sharedAddress);
                },
              });
            });
          } else {
            composeAndSend(address);
          }

          // compose and send
          function composeAndSend(toAddress) {
            let arrSigningDeviceAddresses = []; // empty list means that all signatures are required (such as 2-of-2)
            let opts = {};
            if (fc.credentials.m < fc.credentials.n) {
              $scope.index.copayers.forEach((copayer) => {
                if (copayer.me || copayer.signs) {
                  arrSigningDeviceAddresses.push(copayer.device_address);
                }
              });
            } else if (indexScope.shared_address) {
              arrSigningDeviceAddresses = indexScope.copayers.map(copayer => copayer.device_address);
            }

            breadcrumbs.add(`sending payment in ${asset}`);
            profileService.bKeepUnlocked = true;

            opts = {
              shared_address: indexScope.shared_address,
              merkleProof,
              asset,
              to_address: toAddress,
              amount,
              send_all: false,
              arrSigningDeviceAddresses,
              recipientDeviceAddress,
            };

            let merchantPromise = null;

            // Merchant Payment life cycle
            if (vm.invoiceId !== null) {
              merchantPromise = new Promise((resolve, reject) => {
                const merchantApiRequest = require('request');

                merchantApiRequest(`${ENV.MERCHANT_INTEGRATION_API}/${vm.invoiceId}`, (error, response, body) => {
                  try {
                    const payload = JSON.parse(body).payload;

                    if (error) {
                      console.log(`error: ${error}`); // Print the error if one occurred
                      reject(error);
                    } else {
                      if (payload.state === 'PENDING') {
                        resolve();
                      }

                      reject(`Payment state is ${payload.state}`);
                    }
                  } catch (ex) {
                    console.log(`error: ${ex}`); // Print the error if one occurred
                  }
                });
              });
            } else {
              merchantPromise = Promise.resolve();
            }

            merchantPromise.then(() => {
              if (invoiceId != null) {
                const objectHash = require('byteballcore/object_hash');
                const payload = JSON.stringify({ invoiceId });
                opts.messages = [{
                  app: 'text',
                  payload_location: 'inline',
                  payload_hash: objectHash.getBase64Hash(payload),
                  payload
                }];
              }

              console.log(`PAYMENT OPTIONS BEFORE: ${JSON.stringify(opts)}`);
              useOrIssueNextAddress(fc.credentials.walletId, 0, (addressInfo) => {
                opts.change_address = addressInfo.address;
                fc.sendMultiPayment(opts, (sendMultiPaymentError, unit, assocMnemonics) => {
                  let error = sendMultiPaymentError;
                  // if multisig, it might take very long before the callback is called
                  indexScope.setOngoingProcess(gettextCatalog.getString('sending'), false);
                  breadcrumbs.add(`done payment in ${asset}, err=${sendMultiPaymentError}`);
                  delete vm.current_payment_key;
                  profileService.bKeepUnlocked = false;
                  if (sendMultiPaymentError) {
                    if (sendMultiPaymentError.match(/no funded/) || sendMultiPaymentError.match(/not enough asset coins/)) {
                      error = gettextCatalog.getString('Not enough dagcoins');
                    } else if (sendMultiPaymentError.match(/connection closed/) || sendMultiPaymentError.match(/connect to light vendor failed/)) {
                      error = gettextCatalog.getString('Problems with connecting to the hub. Please try again later');
                    }
                    return vm.setSendError(error);
                  }
                  const binding = vm.binding;

                  if (unit != null && vm.invoiceId != null) {
                    const invoiceId = vm.invoiceId;
                    vm.invoiceId = null;

                    const options = {
                      uri: `${ENV.MERCHANT_INTEGRATION_API}/payment-unit-updated`,
                      method: 'POST',
                      json: {
                        invoiceId,
                        paymentUnitId: unit
                      }
                    };

                    if (invoiceId != null) {
                      const request = require('request');
                      request(options, (error, response, body) => {
                        if (error) {
                          console.log(`PAYMENT UNIT UPDATE ERROR: ${error}`);
                        }
                        console.log(`RESPONSE: ${JSON.stringify(response)}`);
                        console.log(`BODY: ${JSON.stringify(body)}`);
                      });
                    }
                  }

                  vm.resetForm();
                  $rootScope.$emit('NewOutgoingTx');
                  if (recipientDeviceAddress) { // show payment in chat window
                    eventBus.emit('sent_payment', recipientDeviceAddress, amount || 'all', asset, indexScope.walletId, true, toAddress);
                    if (binding && binding.reverseAmount) { // create a request for reverse payment
                      if (!myAddress) {
                        throw Error(gettextCatalog.getString('my address not known'));
                      }
                      const paymentRequestCode = `dagcoin:${myAddress}?amount=${binding.reverseAmount}&asset=${encodeURIComponent(binding.reverseAsset)}`;
                      const paymentRequestText = `[reverse payment](${paymentRequestCode})`;
                      device.sendMessageToDevice(recipientDeviceAddress, 'text', paymentRequestText);
                      correspondentListService.messageEventsByCorrespondent[recipientDeviceAddress].push({
                        bIncoming: false,
                        message: correspondentListService.formatOutgoingMessage(paymentRequestText),
                        timestamp: Math.floor(Date.now() / 1000)
                      });
                      // issue next address to avoid reusing the reverse payment address
                      if (!fc.isSingleAddress) {
                        walletDefinedByKeys.issueNextAddress(fc.credentials.walletId, 0, () => {
                        });
                      }
                    }
                  } else {
                    indexScope.updateHistory((success) => {
                      if (success) {
                        $state.go('walletHome.home');
                        $rootScope.$emit('Local/SetTab', 'walletHome.home');
                        vm.openTxModal(indexScope.txHistory[0], indexScope.txHistory);
                      } else {
                        console.error('updateTxHistory not executed');
                      }
                    });
                  }
                });
              });
              $scope.sendForm.$setPristine();
            }).catch((error) => {
              delete vm.current_payment_key;
              indexScope.setOngoingProcess(gettextCatalog.getString('sending'), false);
              $rootScope.$emit('Local/ShowAlert', error, 'fi-alert', () => {
              });
            });
          }

          function useOrIssueNextAddress(wallet, isChange, handleAddress) {
            if (fc.isSingleAddress) {
              handleAddress({
                address: vm.addr[fc.credentials.walletId]
              });
            } else {
              walletDefinedByKeys.issueNextAddress(wallet, isChange, handleAddress);
            }
          }
        });
      }, 100);
    };

    vm.openBindModal = function () {
      $rootScope.modalOpened = true;
      const fc = profileService.focusedClient;
      const form = $scope.sendForm;
      if (!form || !form.address) {
        // disappeared
        return;
      }

      const ModalInstanceCtrl = function ($scope, $modalInstance) {
        $scope.color = fc.backgroundColor;
        $scope.arrPublicAssetInfos = indexScope.arrBalances.filter(b => !b.is_private).map((b) => {
          const r = { asset: b.asset, displayName: vm.unitName };
          return r;
        });
        $scope.binding = { // defaults
          type: 'reverse_payment',
          timeout: 4,
          reverseAsset: 'base',
          feed_type: 'either',
          oracle_address: ''
        };
        if (vm.binding) {
          $scope.binding.type = vm.binding.type;
          $scope.binding.timeout = vm.binding.timeout;
          if (vm.binding.type === 'reverse_payment') {
            $scope.binding.reverseAsset = vm.binding.reverseAsset;
            $scope.binding.reverseAmount = utilityService.getAmountInDisplayUnits(vm.binding.reverseAmount,
              vm.binding.reverseAsset,
              vm.unitValue);
          } else {
            $scope.binding.oracle_address = vm.binding.oracle_address;
            $scope.binding.feed_name = vm.binding.feed_name;
            $scope.binding.feed_value = vm.binding.feed_value;
            $scope.binding.feed_type = vm.binding.feed_type;
          }
        }

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };

        $scope.bind = function () {
          const binding = { type: $scope.binding.type };
          if (binding.type === 'reverse_payment') {
            binding.reverseAsset = $scope.binding.reverseAsset;
            binding.reverseAmount = utilityService.getAmountInSmallestUnits($scope.binding.reverseAmount,
              $scope.binding.reverseAsset,
              vm.unitValue);
          } else {
            binding.oracle_address = $scope.binding.oracle_address;
            binding.feed_name = $scope.binding.feed_name;
            binding.feed_value = $scope.binding.feed_value;
            binding.feed_type = $scope.binding.feed_type;
          }
          binding.timeout = $scope.binding.timeout;
          vm.binding = binding;
          $modalInstance.dismiss('done');
        };
      };

      const modalInstance = $modal.open({
        templateUrl: 'views/modals/bind.html',
        windowClass: animationService.modalAnimated.slideUp,
        controller: ModalInstanceCtrl
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

    /**
     * Invoked when transaction is sent
     * @param btx
     */
    vm.openTxModal = function (btx) {
      const assetIndex = lodash.findIndex(indexScope.arrBalances, { asset: btx.asset });
      const isPrivate = indexScope.arrBalances[assetIndex].is_private;
      const unitName = vm.unitName;

      transactionsService.openTxModal({
        btx,
        isPrivate,
        walletSettings,
        unitName,
        $rootScope
      });
    };

    $scope.$on('$viewContentLoaded', viewContentLoaded);
    $scope.$on('$destroy', destroy);
  }
})();
