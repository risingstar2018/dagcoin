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
                ENV,
                moment,
                exportTransactions,
                Device,
                $state) {
        const eventBus = require('byteballcore/event_bus.js');
        const breadcrumbs = require('byteballcore/breadcrumbs.js');
        const self = this;
        const conf = require('byteballcore/conf.js');
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
        this.addr = {};
        $scope.index.tab = 'walletHome'; // for some reason, current tab state is tracked in index and survives re-instatiations of walletHome.js
        const disablePaymentRequestListener = $rootScope.$on('paymentRequest', (event, address, amount, asset, recipientDeviceAddress) => {
          console.log(`paymentRequest event ${address}, ${amount}`);
          $rootScope.$emit('Local/SetTab', 'send');
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
          $rootScope.$emit('Local/SetTab', 'send');
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
            $rootScope.$emit('Local/SetTab', 'send');
            self.setForm(uri);
          }, 100);
        });

        const disableAddrListener = $rootScope.$on('Local/NeedNewAddress', () => {
          self.setAddress(true);
        });

        const disableFocusListener = $rootScope.$on('Local/NewFocusedWallet', () => {
          self.addr = {};
          self.resetForm();
        });

        const disableResumeListener = $rootScope.$on('Local/Resume', () => {
          // This is needed then the apps go to sleep
          // looks like it already works ok without rebinding touch events after every resume
          // self.bindTouchDown();
        });

        const disableTabListener = $rootScope.$on('Local/TabChanged', (e, tab) => {
          // This will slow down switch, do not add things here!
          console.log(`tab changed ${tab}`);
          switch (tab) {
            case 'walletHome.receive':
              // TODO sinan moved to receive.controller
              // just to be sure we have an address
              self.setAddress();
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

        eventBus.on('new_wallet_address', onNewWalletAddress);

        $scope.$on('$destroy', () => {
          console.log('walletHome $destroy');
          disableAddrListener();
          disablePaymentRequestListener();
          disableMerchantPaymentRequestListener();
          disablePaymentUriListener();
          disableTabListener();
          disableFocusListener();
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

        self.transactionAddress = (address) => {
          if (!address) {
            return { fullName: gettextCatalog.getString('Incoming transaction') };
          }

          let fullName = address;
          const contact = addressbookService.getContact(address);

          if (contact) {
            fullName = `${contact.first_name} ${contact.last_name || ''}`;
          }

          return { fullName, address };
        };

        $scope.transactionStatus = (transaction) => {
          if (!transaction.confirmations) {
            return { icon: 'autorenew', title: gettextCatalog.getString('Pending') };
          }

          if (transaction.action === 'received') {
            return { icon: 'call_received', title: gettextCatalog.getString('Received') };
          } else if (transaction.action === 'moved') {
            return { icon: 'code', title: gettextCatalog.getString('Moved') };
          }
          return { icon: 'call_made', title: gettextCatalog.getString('Sent') };
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

        this.setAddress = function (forceNew) {
          self.addrError = null;
          const fc = profileService.focusedClient;
          if (!fc) {
            return;
          }

          // Address already set?
          if (!forceNew && self.addr[fc.credentials.walletId]) {
            return;
          }

          if (indexScope.shared_address && forceNew) {
            throw Error('attempt to generate for shared address');
          }

          if (fc.isSingleAddress && forceNew) {
            throw Error('attempt to generate for single address wallets');
          }

          self.generatingAddress = true;
          $timeout(() => {
            addressService.getAddress(fc.credentials.walletId, forceNew, (err, addr) => {
              self.generatingAddress = false;

              if (err) {
                self.addrError = err;
              } else if (addr) {
                self.addr[fc.credentials.walletId] = addr;
              }

              $timeout(() => {
                $scope.$digest();
              });
            });
          });
        };

        // TODO sinan delete after testing
        /*
        this.copyAddress = function (addr) {
          if (isCordova) {
            window.cordova.plugins.clipboard.copy(addr);
            window.plugins.toast.showShortCenter(gettextCatalog.getString('Copied to clipboard'));
          } else if (nodeWebkit.isDefined()) {
            nodeWebkit.writeToClipboard(addr);
          }

          $scope.tooltipCopiedShown = true;

          $timeout(() => {
            $scope.tooltipCopiedShown = false;
          }, 1000);
        };
        */

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

        this.openBindModal = function () {
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
              const r = { asset: b.asset, displayName: self.unitName };
              return r;
            });
            $scope.binding = { // defaults
              type: 'reverse_payment',
              timeout: 4,
              reverseAsset: 'base',
              feed_type: 'either',
              oracle_address: ''
            };
            if (self.binding) {
              $scope.binding.type = self.binding.type;
              $scope.binding.timeout = self.binding.timeout;
              if (self.binding.type === 'reverse_payment') {
                $scope.binding.reverseAsset = self.binding.reverseAsset;
                $scope.binding.reverseAmount = getAmountInDisplayUnits(self.binding.reverseAmount, self.binding.reverseAsset);
              } else {
                $scope.binding.oracle_address = self.binding.oracle_address;
                $scope.binding.feed_name = self.binding.feed_name;
                $scope.binding.feed_value = self.binding.feed_value;
                $scope.binding.feed_type = self.binding.feed_type;
              }
            }

            $scope.cancel = function () {
              $modalInstance.dismiss('cancel');
            };

            $scope.bind = function () {
              const binding = { type: $scope.binding.type };
              if (binding.type === 'reverse_payment') {
                binding.reverseAsset = $scope.binding.reverseAsset;
                binding.reverseAmount = getAmountInSmallestUnits($scope.binding.reverseAmount, $scope.binding.reverseAsset);
              } else {
                binding.oracle_address = $scope.binding.oracle_address;
                binding.feed_name = $scope.binding.feed_name;
                binding.feed_value = $scope.binding.feed_value;
                binding.feed_type = $scope.binding.feed_type;
              }
              binding.timeout = $scope.binding.timeout;
              self.binding = binding;
              $modalInstance.dismiss('done');
            };
          };

          const modalInstance = $modal.open({
            templateUrl: 'views/modals/bind.html',
            windowClass: animationService.modalAnimated.slideUp,
            controller: ModalInstanceCtrl,
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

        function getAmountInSmallestUnits(amount, asset) {
          console.log(amount, asset, self.unitValue);
          const moneyAmount = amount * self.unitValue;
          return Math.round(moneyAmount);
        }

        function getAmountInDisplayUnits(amount) {
          return amount / self.unitValue;
        }

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

        // TODO sinan there are lots of resetForm invoking in walletHome.js, so that this dummy method created
        // remove later
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

        this.openTxModal = function (btx, txHistory) {
          console.log(btx);
          $rootScope.modalOpened = true;
          const self = this;
          const fc = profileService.focusedClient;
          const ModalInstanceCtrl = function ($scope, $modalInstance) {
            $scope.btx = btx;
            const assetIndex = lodash.findIndex(indexScope.arrBalances, { asset: btx.asset });
            $scope.isPrivate = indexScope.arrBalances[assetIndex].is_private;
            $scope.settings = walletSettings;
            $scope.color = fc.backgroundColor;

            $scope.getAmount = function (amount) {
              return self.getAmount(amount);
            };

            $scope.getUnitName = function () {
              return self.getUnitName();
            };

            $scope.transactionAddress = self.transactionAddress;

            $scope.openInExplorer = function () {
              const url = `https://${ENV.explorerPrefix}explorer.dagcoin.org/#${btx.unit}`;
              if (typeof nw !== 'undefined') {
                nw.Shell.openExternal(url);
              } else if (isCordova) {
                cordova.InAppBrowser.open(url, '_system');
              }
            };

            $scope.copyAddress = function (address) {
              utilityService.copyAddress($scope, address);
            };

            $scope.showCorrespondentList = function () {
              self.showCorrespondentListToReSendPrivPayloads(btx);
            };

            $scope.cancel = function () {
              breadcrumbs.add('dismiss tx details');
              try {
                $modalInstance.dismiss('cancel');
              } catch (e) {
                // continue regardless of error
              }
            };
          };

          const modalInstance = $modal.open({
            templateUrl: 'views/modals/tx-details.html',
            windowClass: 'modal-transaction-detail',
            controller: ModalInstanceCtrl,
          });

          const disableCloseModal = $rootScope.$on('closeModal', () => {
            breadcrumbs.add('on closeModal tx details');
            modalInstance.dismiss('cancel');
          });

          modalInstance.result.finally(() => {
            $rootScope.modalOpened = false;
            disableCloseModal();
            const m = angular.element(document.getElementsByClassName('reveal-modal'));
            m.addClass(animationService.modalAnimated.slideOutRight);
          });
        };

        $rootScope.openTxModal = (transaction, rows) => {
          this.openTxModal(transaction, rows);
        };

        this.showCorrespondentListToReSendPrivPayloads = function (btx) {
          $rootScope.modalOpened = true;
          const self = this;
          const fc = profileService.focusedClient;
          const ModalInstanceCtrl = function ($scope, $modalInstance, $timeout, go, notification) {
            $scope.btx = btx;
            $scope.settings = walletSettings;
            $scope.color = fc.backgroundColor;

            $scope.readList = function () {
              $scope.error = null;
              correspondentListService.list((err, ab) => {
                if (err) {
                  $scope.error = err;
                  return;
                }
                $scope.list = ab;
                $scope.$digest();
              });
            };

            $scope.sendPrivatePayments = function (correspondent) {
              const indivisibleAsset = require('byteballcore/indivisible_asset');
              const walletGeneral = require('byteballcore/wallet_general');
              indivisibleAsset.restorePrivateChains(btx.asset, btx.unit, btx.addressTo, (arrRecipientChains) => {
                walletGeneral.sendPrivatePayments(correspondent.device_address, arrRecipientChains, true, null, () => {
                  modalInstance.dismiss('cancel');
                  go.history();
                  $timeout(() => {
                    notification.success(gettextCatalog.getString('Success'), gettextCatalog.getString('Private payloads sent', {}));
                  });
                });
              });
            };

            $scope.back = function () {
              self.openTxModal(btx);
            };
          };

          const modalInstance = $modal.open({
            templateUrl: 'views/modals/correspondentListToReSendPrivPayloads.html',
            windowClass: animationService.modalAnimated.slideRight,
            controller: ModalInstanceCtrl,
          });

          const disableCloseModal = $rootScope.$on('closeModal', () => {
            modalInstance.dismiss('cancel');
          });

          modalInstance.result.finally(() => {
            $rootScope.modalOpened = false;
            disableCloseModal();
            const m = angular.element(document.getElementsByClassName('reveal-modal'));
            m.addClass(animationService.modalAnimated.slideOutRight);
          });
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
        if (profileService.focusedClient) {
          this.setAddress();

          // TODO sinan moved to send.controller, remove this line later
          // this.setSendFormInputs();
        }

      });
}());
