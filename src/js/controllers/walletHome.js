/* eslint-disable radix,no-nested-ternary,no-shadow,no-plusplus,consistent-return,no-underscore-dangle,no-unused-vars,no-use-before-define,comma-dangle */
(function () {
  'use strict';

  angular.module('copayApp.controllers')
    .controller('walletHomeController',
      function ($scope,
                $rootScope,
                $timeout,
                $filter,
                $modal,
                $log,
                notification,
                profileService,
                lodash,
                configService,
                storageService,
                gettext,
                gettextCatalog,
                nodeWebkit,
                addressService,
                confirmDialog,
                animationService,
                addressbookService,
                correspondentListService,
                transactionsService,
                ENV,
                moment,
                exportTransactions,
                Device) {
        const eventBus = require('byteballcore/event_bus.js');
        const breadcrumbs = require('byteballcore/breadcrumbs.js');
        const self = this;
        $rootScope.hideMenuBar = false;
        $rootScope.wpInputFocused = false;
        const config = configService.getSync();
        const configWallet = config.wallet;
        const indexScope = $scope.index;
        const isCordova = Device.cordova;
        $scope.currentSpendUnconfirmed = configWallet.spendUnconfirmed;

        // INIT
        const walletSettings = configWallet.settings;
        this.unitValue = walletSettings.unitValue;
        this.unitName = walletSettings.unitName;
        this.unitDecimals = walletSettings.unitDecimals;

        this.addresses = [];
        this.isMobile = Device.any;
        this.blockUx = false;

        // TODO sinan will be test after find out how 'paymentRequest' event is produced
        const disablePaymentRequestListener = $rootScope.$on('paymentRequest', (event, address, amount, asset, recipientDeviceAddress) => {
          console.log(`paymentRequest event ${address}, ${amount}`);
          $rootScope.$emit('Local/SetTab', 'walletHome.send');
          self.setForm(address, amount, null, asset, recipientDeviceAddress);

          const form = $scope.sendForm;
          if (form.address.$invalid && !self.blockUx) {
            console.log('invalid address, resetting form');
            self.resetForm();
            self.error = gettextCatalog.getString('Could not recognize a valid Dagcoin QR Code');
          }
        });

        const disableMerchantPaymentRequestListener = $rootScope.$on('merchantPaymentRequest', (event, address, amount, invoiceId, validForSeconds, merchantName, state) => {
          console.log(`paymentRequest event ${address}, ${amount}`);
          $rootScope.$emit('Local/SetTab', 'walletHome.send');
          this.invoiceId = invoiceId;
          this.validForSeconds = Math.floor(validForSeconds - 10); // 10 is a security threshold

          const processNonPendingStates = (state) => {
            let errorMessage = '';

            switch (state) {
              case 'EXPIRED':
                errorMessage = gettextCatalog.getString('Merchant payment request expired');
                break;
              case 'CANCELLED':
                errorMessage = gettextCatalog.getString('Merchant payment request has been cancelled');
                break;
              case 'FAILED':
                errorMessage = gettextCatalog.getString('Merchant payment request failed');
                break;
              default:
                errorMessage = gettextCatalog.getString('An error occurred during merchant request processing');
                break;
            }

            self.resetForm();
            self.error = errorMessage;
          };

          if (state === 'PENDING') {
            self.setForm(address, amount, null, ENV.DAGCOIN_ASSET, null);

            const form = $scope.sendForm;

            if (form.address.$invalid && !self.blockUx) {
              console.log('invalid address, resetting form');
              self.resetForm();
              self.error = gettextCatalog.getString('Could not recognize a valid Dagcoin QR Code');
            }

            if (this.validForSeconds <= 0) {
              self.resetForm();
              self.error = gettextCatalog.getString('Merchant payment request expired');
            }

            self.countDown();
          } else {
            processNonPendingStates(state);
          }
        });

        const disablePaymentUriListener = $rootScope.$on('paymentUri', (event, uri) => {
          $timeout(() => {
            $rootScope.$emit('Local/SetTab', 'walletHome.send');
            self.setForm(uri);
          }, 100);
        });

        const disableAddrListener = $rootScope.$on('Local/NeedNewAddress', () => {
          self.setAddress(true);
        });

        // TODO sinan Local/NewFocusedWallet is used for receive.controller.
        // in receive.controller these rows already written in viewContentLoaded method
        /**
        const disableFocusListener = $rootScope.$on('Local/NewFocusedWallet', () => {
          self.addr = {};
          self.resetForm();
        });
         */

        const disableResumeListener = $rootScope.$on('Local/Resume', () => {
          // This is needed then the apps go to sleep
          // looks like it already works ok without rebinding touch events after every resume
          // self.bindTouchDown();
        });

        // TODO sinan remove later after testing
        const disableTabListener = $rootScope.$on('Local/TabChanged', (e, tab) => {
          // This will slow down switch, do not add things here!
          console.log(`tab changed ${tab}`);
          switch (tab) {
            case 'walletHome.receive':
              // TODO sinan moved to receive.controller
              // just to be sure we have an address
              // self.setAddress();
              break;
            case 'walletHome.home':
              // TODO sinan $scope.sendForm.$setPristine(); why this method is called. will be removed.
              // self.resetForm();
              break;
            case 'walletHome.send':
              // TODO sinan moved to send.controller
              /*
              $scope.sendForm.$setPristine();
              self.resetForm(() => {
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
              */

              break;
            default:
            // do nothing
          }
        });

        const disableOngoingProcessListener = $rootScope.$on('Addon/OngoingProcess', (e, name) => {
          self.setOngoingProcess(name);
        });

        function onNewWalletAddress(newAddress) {
          console.log(`==== NEW ADDRESSS ${newAddress}`);
          self.addr = {};
          self.setAddress();
        }

        // TODO sinan in new wallet address event
        // eventBus.on('new_wallet_address', onNewWalletAddress);

        $scope.$on('$destroy', () => {
          console.log('walletHome $destroy');
          disableAddrListener();
          disablePaymentRequestListener();
          disableMerchantPaymentRequestListener();
          disablePaymentUriListener();
          disableTabListener();
          // disableFocusListener();
          disableResumeListener();
          disableOngoingProcessListener();
          $rootScope.hideMenuBar = false;
          eventBus.removeListener('new_wallet_address', onNewWalletAddress);
        });

        // const accept_msg = gettextCatalog.getString('Accept');
        // const cancel_msg = gettextCatalog.getString('Cancel');
        // const confirm_msg = gettextCatalog.getString('Confirm');

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

        // TODO sinan should be removed after converting tx history into directive
        self.transactionAddress = function (address) {
          return transactionsService.getTransactionAddress(address);
        };

        // TODO sinan should be removed after converting tx history into directive
        $scope.transactionStatus = function (transaction) {
          return transactionsService.getTransactionStatus(transaction);
        };

        $scope.openSharedAddressDefinitionModal = function (address) {
          $rootScope.modalOpened = true;
          const fc = profileService.focusedClient;

          const ModalInstanceCtrl = function ($scope, $modalInstance) {
            $scope.color = fc.backgroundColor;
            $scope.address = address;

            const walletGeneral = require('byteballcore/wallet_general.js');
            const walletDefinedByAddresses = require('byteballcore/wallet_defined_by_addresses.js');
            walletGeneral.readMyAddresses((arrMyAddresses) => {
              walletDefinedByAddresses.readSharedAddressDefinition(address, (arrDefinition, creationTs) => {
                $scope.humanReadableDefinition = correspondentListService.getHumanReadableDefinition(arrDefinition, arrMyAddresses, [], true);
                $scope.creation_ts = creationTs;
                walletDefinedByAddresses.readSharedAddressCosigners(address, (cosigners) => {
                  $scope.cosigners = cosigners.map(cosigner => cosigner.name).join(', ');
                  $scope.$apply();
                });
              });
            });

            // clicked a link in the definition
            $scope.sendPayment = function (receiverAddress, amount) {
              $modalInstance.dismiss('done');
              return $timeout(() => {
                indexScope.shared_address = null;
                indexScope.updateAll();
                indexScope.updateTxHistory();
                $rootScope.$emit('paymentRequest', receiverAddress, amount, 'base');
              });
            };

            $scope.cancel = function () {
              breadcrumbs.add('openSharedAddressDefinitionModal cancel');
              $modalInstance.dismiss('cancel');
            };
          };

          const modalInstance = $modal.open({
            templateUrl: 'views/modals/address-definition.html',
            windowClass: animationService.modalAnimated.slideUp,
            controller: ModalInstanceCtrl,
          });

          const disableCloseModal = $rootScope.$on('closeModal', () => {
            breadcrumbs.add('openSharedAddressDefinitionModal on closeModal');
            modalInstance.dismiss('cancel');
          });

          modalInstance.result.finally(() => {
            $rootScope.modalOpened = false;
            disableCloseModal();
            const m = angular.element(document.getElementsByClassName('reveal-modal'));
            m.addClass(animationService.modalAnimated.slideOutDown);
          });
        };

        this.exportTransactions = () => {
          exportTransactions.toCSV();
        };

        this.openTxpModal = function () {
          // deleted, maybe restore from copay sometime later
          // actually, nothing to display here that was not already shown
        };

        this.countDown = function () {
          const self = this;

          if (this.validForSeconds == null) {
            // Form has been reset
            return;
          }

          if (this.validForSeconds <= 0) {
            self.resetForm();
            self.error = gettextCatalog.getString('Payment request expired');
            return;
          }

          $timeout(() => {
            self.validForSeconds -= 1;
            self.countDown();
          }, 1000);
        };

        this.shareAddress = function (addr) {
          if (isCordova) {
            window.plugins.socialsharing.share(addr, null, null, null);
          }
        };

        // Send

        const unwatchSpendUnconfirmed = $scope.$watch('currentSpendUnconfirmed', (newVal, oldVal) => {
          if (newVal === oldVal) return;
          $scope.currentSpendUnconfirmed = newVal;
        });

        $scope.$on('$destroy', () => {
          unwatchSpendUnconfirmed();
        });

        this.bindTouchDown = function (tries) {
          const self = this;
          let touchDownTries = tries || 0;
          if (touchDownTries > 5) return;
          const e = document.getElementById('menu-walletHome');
          if (!e) {
            $timeout(() => {
              self.bindTouchDown(++touchDownTries);
            }, 500);
          }

          // on touchdown elements
          $log.debug('Binding touchstart elements...');
          ['hamburger', 'menu-walletHome', 'menu-send', 'menu-receive', 'menu-history'].forEach((id) => {
            const e = document.getElementById(id);
            if (e) {
              e.addEventListener('touchstart', () => {
                try {
                  event.preventDefault();
                } catch (e) {
                  // continue regardless of error
                }
                angular.element(e).triggerHandler('click');
              }, true);
            }
          });
        };

        this.hideMenuBar = lodash.debounce(function (hide) {
          if (hide) {
            $rootScope.hideMenuBar = true;
            this.bindTouchDown();
          } else {
            $rootScope.hideMenuBar = false;
          }
          $rootScope.$digest();
        }, 100);

        this.formFocus = function (what) {
          if (isCordova) {
            this.hideMenuBar(what);
          }

          if (!what) {
            this.hideAddress = false;
            this.hideAmount = false;
          } else if (what === 'amount') {
            this.hideAddress = true;
          } else if (what === 'msg') {
            this.hideAddress = true;
            this.hideAmount = true;
          }
          $timeout(() => {
            $rootScope.$digest();
          }, 1);
        };

        this.setOngoingProcess = function (name) {
          const self = this;
          self.blockUx = !!name;

          if (isCordova) {
            if (name) {
              window.plugins.spinnerDialog.hide();
              window.plugins.spinnerDialog.show(null, `${name}...`, true);
            } else {
              window.plugins.spinnerDialog.hide();
            }
          } else {
            self.onGoingProcess = name;
            $timeout(() => {
              $rootScope.$apply();
            });
          }
        };

        // TODO sinan must be deleted after testing disablePaymentRequestListener and disableMerchantPaymentRequestListener
        this.setForm = function (to, amount, comment, asset, recipientDeviceAddress) {
          this.resetError();
          delete this.binding;
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
              // TODO sinan eslint issue, will be already remove with this.setForm method
              // assocDeviceAddressesByPaymentAddress[to] = recipientDeviceAddress;
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

        // TODO sinan there are lots of resetForm invoking in walletHome.js, so that this dummy method created
        // TODO remove later
        this.resetForm = (cb) => {

        };

        this.setFromUri = function (uri) {
          let objRequest;
          require('byteballcore/uri.js').parseUri(uri, {
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

        // History

        function strip(number) {
          return (parseFloat(number.toPrecision(12)));
        }

        this.getUnitName = function () {
          return this.unitName;
        };

        this.openTxModal = function (btx) {
          const assetIndex = lodash.findIndex(indexScope.arrBalances, { asset: btx.asset });
          const isPrivate = indexScope.arrBalances[assetIndex].is_private;
          const unitName = self.getUnitName();
          const transactionAddress = self.transactionAddress;

          transactionsService.openTxModal({
            btx,
            isPrivate,
            walletSettings,
            unitName,
            transactionAddress,
            $rootScope
          });
        };

        $rootScope.openTxModal = (transaction, rows) => {
          this.openTxModal(transaction, rows);
        };

        this.hasAction = function (actions) {
          return Object.prototype.hasOwnProperty.call(actions, 'create');
        };

        /* Start setup */

        this.getFontSizeForWalletNumber = (value, type) => {
          if (value) {
            const visibleWidth = window.innerWidth - 50;
            const str = value.toString().split('.');

            const length = str[0].length + ((str[1] || 0).length / 2);
            const size = ((visibleWidth / length) < 70 ? ((visibleWidth / length) + 10) : 80);

            return { 'font-size': `${(!type ? size : size / 2)}px` };
          }
          return { 'font-size': '80px' };
        };

        this.bindTouchDown();

        // TODO sinan remove tests are finished
        if (profileService.focusedClient) {
          // this.setAddress();

          // TODO sinan moved to send.controller, remove this line later
          // this.setSendFormInputs();
        }
      });
}());
