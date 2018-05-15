/* eslint-disable radix,no-nested-ternary,no-shadow,no-plusplus,consistent-return,no-underscore-dangle,no-use-before-define,comma-dangle,no-undef */
(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('SendCtrl', SendCtrl);

  SendCtrl.$inject = ['$scope', '$rootScope', '$timeout', 'lodash', 'profileService',
    'configService', 'addressService', 'addressbookService', 'animationService', 'gettextCatalog',
    'utilityService', 'transactionsService', 'walletService', 'ENV', '$modal', '$state', '$stateParams'];

  function SendCtrl($scope, $rootScope, $timeout, lodash, profileService,
                    configService, addressService, addressbookService, animationService, gettextCatalog,
                    utilityService, transactionsService, walletService, ENV, $modal, $state, $stateParams) {
    const breadcrumbs = require('core/breadcrumbs.js');
    const eventBus = require('core/event_bus.js');

    const indexScope = $scope.index;
    const config = configService.getSync();
    const configWallet = config.wallet;
    const vm = this;

    // INIT
    const walletSettings = configWallet.settings;
    vm.unitValue = walletSettings.unitValue;
    vm.unitName = walletSettings.unitName;
    vm.unitDecimals = walletSettings.unitDecimals;
    vm.blockUx = false;
    vm.lockAddress = false;
    vm.lockAmount = false;
    vm.invoiceTimeout = null;

    const assocDeviceAddressesByPaymentAddress = {};

    $scope.currentSpendUnconfirmed = configWallet.spendUnconfirmed;
    $scope.hasContact = false;
    /**
     * Runs when the view of controller is rendered
     * Make all initialization of controller in this method
     */
    const viewContentLoaded = function () {
      console.log('SendCtrl initialized');
      const request = lodash.assign(new PaymentRequest(), $stateParams);
      $scope.sendForm.$setPristine();
      if (profileService.focusedClient) {
        vm.setSendFormInputs();
      }
      if (request.isNotEmpty()) {
        const form = $scope.sendForm;
        console.log(`A payment requested. Form will be rendered with these values ${JSON.stringify(request)}`);

        // if amount is sent -1, it means that remove last entered amount from rootscope so that clear the amount
        if (parseInt(request.amount, 10) === PaymentRequest.DUMMY_AMOUNT_FOR_CLEARING) {
          request.amount = '';
          $rootScope.alreadyEnteredSendAll = null;
          $rootScope.alreadyEnteredAmount = null;
        }

        if (PaymentRequest.PAYMENT_REQUEST === request.type) {
          vm.setForm(request.address, request.amount, request.comment, request.asset, request.recipientDeviceAddress);
          if (!form.address.$isValid && !vm.blockUx) {
            console.error('Payment Request :: invalid address, resetting form');
            vm.resetForm();
            vm.error = gettextCatalog.getString('Could not recognize a valid Dagcoin QR Code');
          }
        } else if (PaymentRequest.MERCHANT_PAYMENT_REQUEST === request.type) {
          vm.invoiceId = request.invoiceId;
          vm.publicId = request.publicId;
          vm.validForSeconds = Math.floor(request.validForSeconds - 10); // 10 is a security threshold ??
          if (request.state === 'PENDING') {
            vm.setForm(request.address, request.amount, null, ENV.DAGCOIN_ASSET, null, true);
            if (form.address.$invalid && !vm.blockUx) {
              console.error('Merchant Payment Request :: invalid address, resetting form');
              vm.resetForm();
              vm.error = gettextCatalog.getString('Could not recognize a valid Dagcoin QR Code');
            }
            if (vm.validForSeconds <= 0) {
              vm.resetForm();
              vm.error = gettextCatalog.getString('Merchant payment request expired');
            }
            vm.countDown();
          } else {
            vm.resetForm();
            vm.error = walletService.getStateErrorMessageForMerchantPayment(request.state);
          }
        } else if (PaymentRequest.URI === request.type) {
          vm.setFromUri(request.uri);
        }
      } else {
        $rootScope.alreadyEnteredAmount = '';
        $rootScope.alreadyEnteredSendAll = null;
      }
    };

    const destroy = () => {
      console.log('SendCtrl $destroy');
      $rootScope.hideMenuBar = false;
    };

    vm.countDown = function () {
      if (vm.validForSeconds === null) {
        // Form has been reset
        return;
      }

      if (vm.validForSeconds <= 0) {
        vm.resetForm();
        vm.error = gettextCatalog.getString('Payment request expired');
        return;
      }

      vm.invoiceTimeout = $timeout(() => {
        vm.validForSeconds -= 1;
        vm.countDown();
      }, 1000);
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
          },
          enumerable: true,
          configurable: true,
        });

      // ToDo: use a credential's (or fc's) function for this
      vm.hideNote = true;
    };

    vm.setForm = function (to, amount, comment, asset, recipientDeviceAddress, isMerchant) {
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

        if (recipientDeviceAddress) {
          // must be already paired
          assocDeviceAddressesByPaymentAddress[to] = recipientDeviceAddress;
        }
      }

      vm.lockAddress = to && isMerchant;

      if (!lodash.isEmpty(moneyAmount)) {
        moneyAmount /= vm.unitValue;
        vm.lockAmount = true;
        $timeout(() => {
          form.amount.$setViewValue(`${moneyAmount}`);
          form.amount.$isValid = true;
          form.amount.$render();
        }, 100);
      } else {
        vm.lockAmount = false;
        form.amount.$pristine = true;

        // send.controller is called whether from payment request from chat, or from scanning barcode
        // If just address barcode is scanned and there is an already entered amount, this amount value is read
        if (!lodash.isEmpty($rootScope.alreadyEnteredAmount)) {
          form.amount.$setViewValue(`${$rootScope.alreadyEnteredAmount}`);
          form.amount.$isValid = true;
          vm.bSendAll = $rootScope.alreadyEnteredSendAll;
        }
        if ($rootScope.alreadyEnteredSendAll) {
          vm.setSendAll({
            hideAlert: true
          });
        }
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
        vm.lockAsset = true;
      } else {
        vm.lockAsset = false;
      }
    };

    vm.setFromUri = function (uri) {
      let objRequest = {};
      require('core/uri.js').parseUri(uri, {
        ifError() {
        },
        ifOk(_objRequest) {
          objRequest = _objRequest; // the callback is called synchronously
        },
      });

      if (!objRequest) {
        // failed to parse
        return uri;
      }
      if (objRequest.amount) {
        // setForm() cares about units conversion
        this.setForm(objRequest.address, objRequest.amount);
      }
      return objRequest.address;
    };

    vm.cancelForm = function (cb) {
      const invoiceId = this.invoiceId;

      if (invoiceId !== null) {
        const options = {
          uri: `${ENV.MERCHANT_INTEGRATION_API}/cancel`,
          method: 'POST',
          json: {
            invoiceId
          }
        };
        const request = require('request');
        request(options, (error, response, body) => {
          if (error) {
            console.log(`CANCEL ERROR: ${error}`);
          }
          console.log(`RESPONSE: ${JSON.stringify(response)}`);
          console.log(`BODY: ${JSON.stringify(body)}`);
          self.error = gettextCatalog.getString('Payment is cancelled');
        });
      }

      vm.resetForm(cb);
    };


    vm.resetForm = function (cb) {
      this.resetError();
      delete this.binding;

      if (this.invoiceTimeout) {
        $timeout.cancel(this.invoiceTimeout);
      }

      this.invoiceId = null;
      this.publicId = null;
      this.validForSeconds = null;
      this.publicId = null;
      this.lockAsset = false;
      this.lockAddress = false;
      this.lockAmount = false;
      // this.hideAdvSend = true;
      $scope.currentSpendUnconfirmed = configService.getSync().wallet.spendUnconfirmed;

      this._amount = null;
      this._address = null;
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

    vm.setSendAll = (pOpts) => {
      const opts = pOpts || {};
      const form = $scope.sendForm;
      if (!form || !form.amount || indexScope.arrBalances.length === 0) {
        return;
      }
      vm.lockAmount = true;
      let available = indexScope.baseBalance.stable;
      $rootScope.alreadyEnteredSendAll = true;
      if (!opts.hideAlert) {
        $rootScope.$emit('Local/ShowAlert', gettextCatalog.getString('You are sending all your stable amount. Transaction fee will be automatically excluded!'), 'fi-alert', () => {
          available /= vm.unitValue;
          vm.bSendAll = true;
          form.amount.$setViewValue(`${available}`);
          form.amount.$render();
          $scope.amountBlur();
        });
      }
    };

    vm.cancelSendAll = () => {
      const form = $scope.sendForm;
      $rootScope.alreadyEnteredAmount = null;
      $rootScope.alreadyEnteredSendAll = null;
      form.amount.$setViewValue('');
      vm.lockAmount = false;
      vm.bSendAll = false;
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
            $scope.hasContact = lodash.size($scope.list) > 0;
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
    };

    vm.setSendError = function (err) {
      const fc = profileService.focusedClient;
      const prefix = fc.credentials.m > 1 ?
        gettextCatalog.getString('Could not create payment proposal') :
        gettextCatalog.getString('Could not send payment');

      vm.error = `${prefix}: ${err}`;
      console.log(vm.error);

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

      if (utilityService.isCordova) {
        vm.hideAddress = false;
        vm.hideAmount = false;
      }

      const form = $scope.sendForm;
      if (!form) {
        return console.log('form is gone');
      }
      if (form.$invalid) {
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
      const publicId = vm.publicId;
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
        const device = require('core/device.js');
        const sendCoinRequest = new SendCoinRequestBuilder()
          .binding(vm.binding)
          .recipientDeviceAddress(recipientDeviceAddress)
          .myDeviceAddress(device.getMyDeviceAddress())
          .sharedAddress(indexScope.shared_address)
          .copayers($scope.index.copayers)
          .invoiceId(invoiceId)
          .publicId(publicId)
          .address(address)
          .merkleProof(merkleProof)
          .amount(amount)
          .bSendAll(vm.bSendAll)
          .requestTouchidCb((err) => {
            profileService.lockFC();
            indexScope.setOngoingProcess(gettextCatalog.getString('sending'), false);
            vm.error = err;
            $timeout(() => {
              delete vm.current_payment_key;
              $scope.$digest();
            }, 1);
          })
          .createNewSharedAddressCb((err) => {
            delete vm.current_payment_key;
            indexScope.setOngoingProcess(gettextCatalog.getString('sending'), false);
            vm.setSendError(err);
          })
          .sendMultiPaymentDoneBeforeCb((sendMultiPaymentError) => {
            // if multisig, it might take very long before the callback is called
            indexScope.setOngoingProcess(gettextCatalog.getString('sending'), false);
            breadcrumbs.add(`done payment in ${asset}, err=${sendMultiPaymentError}`);
            delete vm.current_payment_key;
            profileService.bKeepUnlocked = false;
          })
          .sendMultiPaymentDoneErrorCb((err) => {
            vm.setSendError(err);
          })
          .sendMultiPaymentDoneAfter((rcptDeviceAddress, toAddress, rAsset) => {
            vm.resetForm();
            $rootScope.$emit('NewOutgoingTx');
            if (rcptDeviceAddress) {
              eventBus.emit('sent_payment', rcptDeviceAddress, amount || 'all', rAsset, indexScope.walletId, true, toAddress);
            } else {
              indexScope.updateHistory((success) => {
                if (success) {
                  $state.go('wallet.home');
                  $rootScope.$emit('Local/SetTab', 'wallet.home');
                  vm.openTxModal(indexScope.txHistory[0]);
                } else {
                  console.error('updateTxHistory not executed');
                }
              });
            }
          })
          .composeAndSendDoneCb(() => {
            $scope.sendForm.$setPristine();
          })
          .composeAndSendErrorCb((error) => {
            delete vm.current_payment_key;
            indexScope.setOngoingProcess(gettextCatalog.getString('sending'), false);
            $rootScope.$emit('Local/ShowAlert', error, 'fi-alert', () => { });
          })
          .build();
        walletService.sendCoin(sendCoinRequest);
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
        $scope.arrPublicAssetInfos = indexScope.arrBalances.filter(b => !b.is_private).map(b => ({ asset: b.asset, displayName: vm.unitName }));
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
      transactionsService.openTxModal({
        btx,
        walletSettings,
        $rootScope
      });
    };

    /**
     * $rootScope.alreadyEnteredAmount is used for storing entered amount,
     * after scanning barcode of an address, send.controller is created again.
     * In order to get already entered amount alreadyEnteredAmount variable is used.
     */
    $scope.amountBlur = () => {
      $rootScope.alreadyEnteredAmount = $scope.sendForm.amount.$viewValue;
    };

    $scope.$on('$viewContentLoaded', viewContentLoaded);
    $scope.$on('$destroy', destroy);
  }
})();
