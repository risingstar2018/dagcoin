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
                isCordova,
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
                discoveryService,
                isMobile,
                fundingExchangeClientService,
                ENV,
                migrationService,
                moment,
                exportTransactions) {
        migrationService.migrate();
        const constants = require('byteballcore/constants.js');
        const eventBus = require('byteballcore/event_bus.js');
        const breadcrumbs = require('byteballcore/breadcrumbs.js');
        const self = this;
        const conf = require('byteballcore/conf.js');
        self.protocol = ENV.protocolPrefix;
        $rootScope.hideMenuBar = false;
        $rootScope.wpInputFocused = false;
        const config = configService.getSync();
        const configWallet = config.wallet;
        const indexScope = $scope.index;
        $scope.currentSpendUnconfirmed = configWallet.spendUnconfirmed;

        // INIT
        const walletSettings = configWallet.settings;
        this.unitValue = walletSettings.unitValue;
        this.dagUnitValue = walletSettings.dagUnitValue;
        this.unitName = walletSettings.unitName;
        this.dagUnitName = walletSettings.dagUnitName;
        this.unitDecimals = walletSettings.unitDecimals;
        this.isCordova = isCordova;
        this.addresses = [];
        this.isMobile = isMobile.any();
        this.isWindowsPhoneApp = isMobile.Windows() && isCordova;
        this.blockUx = false;
        this.showScanner = false;
        this.isMobile = isMobile.any();
        this.addr = {};
        this.invoiceTimeout = null;
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
            self.setForm(address, amount, null, ENV.DAGCOIN_ASSET, null, true);

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
            case 'receive':
              // just to be sure we have an address
              self.setAddress();
              break;
            case 'walletHome':
              $scope.sendForm.$setPristine();
              self.resetForm();
              break;
            case 'send':
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

        $scope.openDestinationAddressModal = function (wallets, address) {
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
            $scope.bAllowAddressbook = self.canSendExternalPayment();
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
                  self.error = err;
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
              self.setToAddress(addr);
            }
          });
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
            $scope.sendPayment = function (receiverAddress, amount, asset) {
              if (asset && indexScope.arrBalances.filter(balance => (balance.asset === asset)).length === 0) {
                return console.log(`i do not own anything of asset ${asset}`);
              }
              $modalInstance.dismiss('done');
              return $timeout(() => {
                indexScope.shared_address = null;
                indexScope.updateAll();
                indexScope.updateTxHistory();
                $rootScope.$emit('paymentRequest', receiverAddress, amount, asset);
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

          this.invoiceTimeout = $timeout(() => {
            self.validForSeconds -= 1;
            self.countDown();
          }, 1000);
        };

        this.shareAddress = function (addr) {
          if (isCordova) {
            if (isMobile.Android() || isMobile.Windows()) {
              window.ignoreMobilePause = true;
            }
            window.plugins.socialsharing.share(addr, null, null, null);
          }
        };

        this.openCustomizedAmountModal = function (addr) {
          $rootScope.modalOpened = true;
          const self = this;
          const fc = profileService.focusedClient;
          const ModalInstanceCtrl = function ($scope, $modalInstance) {
            $scope.addr = addr;
            $scope.color = fc.backgroundColor;
            $scope.unitName = self.unitName;
            $scope.unitValue = self.unitValue;
            $scope.unitDecimals = self.unitDecimals;
            $scope.dagUnitValue = walletSettings.dagUnitValue;
            $scope.dagUnitName = walletSettings.dagUnitName;
            $scope.dagAsset = ENV.DAGCOIN_ASSET;
            $scope.isCordova = isCordova;
            $scope.buttonLabel = gettextCatalog.getString('Generate QR Code');
            $scope.protocol = conf.program;

            Object.defineProperty($scope, '_customAmount', {
              get() {
                return $scope.customAmount;
              },
              set(newValue) {
                $scope.customAmount = newValue;
              },
              enumerable: true,
              configurable: true,
            });

            $scope.submitForm = function (form) {
              if ($scope.index.arrBalances.length === 0) {
                return console.log('openCustomizedAmountModal: no balances yet');
              }
              const amount = form.amount.$modelValue;
              const asset = ENV.DAGCOIN_ASSET;
              if (!asset) {
                throw Error('no asset');
              }

              const amountInSmallestUnits = parseInt((amount * $scope.dagUnitValue).toFixed(0));

              return $timeout(() => {
                $scope.customizedAmountUnit = `${amount} ${(asset === 'base') ? $scope.unitName : (asset === ENV.DAGCOIN_ASSET ? $scope.dagUnitName : `of ${asset}`)}`;
                $scope.amountInSmallestUnits = amountInSmallestUnits;
                $scope.asset_param = (asset === 'base') ? '' : `&asset=${encodeURIComponent(asset)}`;
              }, 1);
            };

            $scope.shareAddress = function (uri) {
              if (isMobile.Android()) {
                window.ignoreMobilePause = true;
              }
              window.plugins.socialsharing.share(uri, null, null, null);
            };

            $scope.cancel = function () {
              breadcrumbs.add('openCustomizedAmountModal: cancel');
              $modalInstance.dismiss('cancel');
            };
          };

          const modalInstance = $modal.open({
            templateUrl: 'views/modals/customized-amount.html',
            windowClass: animationService.modalAnimated.slideUp,
            controller: ModalInstanceCtrl,
            scope: $scope,
          });

          const disableCloseModal = $rootScope.$on('closeModal', () => {
            breadcrumbs.add('openCustomizedAmountModal: on closeModal');
            modalInstance.dismiss('cancel');
          });

          modalInstance.result.finally(() => {
            $rootScope.modalOpened = false;
            disableCloseModal();
            const m = angular.element(document.getElementsByClassName('reveal-modal'));
            m.addClass(animationService.modalAnimated.slideOutDown);
          });
        };

        // Send

        const unwatchSpendUnconfirmed = $scope.$watch('currentSpendUnconfirmed', (newVal, oldVal) => {
          if (newVal === oldVal) return;
          $scope.currentSpendUnconfirmed = newVal;
        });

        $scope.$on('$destroy', () => {
          unwatchSpendUnconfirmed();
        });

        this.resetError = function () {
          this.error = null;
          this.success = null;
        };

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
          if (isCordova && !this.isWindowsPhoneApp) {
            this.hideMenuBar(what);
          }
          if (!this.isWindowsPhoneApp) return;

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

        this.setSendFormInputs = function () {
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
                self.resetError();
              },
              enumerable: true,
              configurable: true,
            });

          Object.defineProperty($scope,
            '_address', {
              get() {
                return $scope.__address;
              },
              set(newValue) {
                $scope.__address = self.onAddressChange(newValue);
              },
              enumerable: true,
              configurable: true,
            });

          // ToDo: use a credential's (or fc's) function for this
          this.hideNote = true;
        };

        this.setSendError = function (err) {
          const fc = profileService.focusedClient;
          const prefix =
            fc.credentials.m > 1 ? gettextCatalog.getString('Could not create payment proposal') : gettextCatalog.getString('Could not send payment');

          this.error = `${prefix}: ${err}`;
          console.log(this.error);

          $timeout(() => {
            $scope.$digest();
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

        this.submitForm = function () {
          if ($scope.index.arrBalances.length === 0) {
            return console.log('send payment: no balances yet');
          }
          const fc = profileService.focusedClient;
          const dagUnitValue = this.dagUnitValue;

          if (isCordova && this.isWindowsPhoneApp) {
            this.hideAddress = false;
            this.hideAmount = false;
          }

          const form = $scope.sendForm;
          if (!form) {
            return console.log('form is gone');
          }
          if (form.$invalid) {
            this.error = gettextCatalog.getString('Unable to send transaction proposal');
            return;
          }
          if (fc.isPrivKeyEncrypted()) {
            profileService.unlockFC(null, (err) => {
              if (err) {
                return self.setSendError(err.message);
              }
              return self.submitForm();
            });
            return;
          }

          const asset = ENV.DAGCOIN_ASSET;
          console.log(`asset ${asset}`);
          const address = form.address.$modelValue;
          const recipientDeviceAddress = assocDeviceAddressesByPaymentAddress[address];
          let amount = form.amount.$modelValue;
          const invoiceId = this.invoiceId;
          // const paymentId = 1;
          let merkleProof = '';
          if (form.merkle_proof && form.merkle_proof.$modelValue) {
            merkleProof = form.merkle_proof.$modelValue.trim();
          }
          amount *= dagUnitValue;
          amount = Math.round(amount);

          const currentPaymentKey = `${asset}${address}${amount}`;
          if (currentPaymentKey === self.current_payment_key) {
            return $rootScope.$emit('Local/ShowErrorAlert', 'This payment is being processed');
          }
          self.current_payment_key = currentPaymentKey;

          indexScope.setOngoingProcess(gettextCatalog.getString('sending'), true);
          $timeout(() => {
            profileService.requestTouchid(null, (err) => {
              if (err) {
                profileService.lockFC();
                indexScope.setOngoingProcess(gettextCatalog.getString('sending'), false);
                self.error = err;
                $timeout(() => {
                  delete self.current_payment_key;
                  $scope.$digest();
                }, 1);
                return;
              }
              let myAddress;
              const device = require('byteballcore/device.js');
              const walletDefinedByKeys = require('byteballcore/wallet_defined_by_keys.js');
              if (self.binding) {
                if (!recipientDeviceAddress) {
                  throw Error(gettextCatalog.getString('recipient device address not known'));
                }
                const walletDefinedByAddresses = require('byteballcore/wallet_defined_by_addresses.js');

                // never reuse addresses as the required output could be already present
                walletDefinedByKeys.issueNextAddress(fc.credentials.walletId, 0, (addressInfo) => {
                  myAddress = addressInfo.address;
                  let arrDefinition;
                  let assocSignersByPath;
                  if (self.binding.type === 'reverse_payment') {
                    const arrSeenCondition = ['seen', {
                      what: 'output',
                      address: myAddress,
                      asset: ENV.DAGCOIN_ASSET,
                      amount: self.binding.reverseAmount,
                    }];
                    arrDefinition = ['or', [
                      ['and', [
                        ['address', address],
                        arrSeenCondition,
                      ]],
                      ['and', [
                        ['address', myAddress],
                        ['not', arrSeenCondition],
                        ['in data feed', [[ENV.TIMESTAMPER_ADDRESS], 'timestamp', '>', Date.now() + Math.round(self.binding.timeout * 3600 * 1000)]],
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
                    const arrExplicitEventCondition = ['in data feed', [[self.binding.oracle_address], self.binding.feed_name, '=', self.binding.feed_value]];
                    const arrMerkleEventCondition = ['in merkle', [[self.binding.oracle_address], self.binding.feed_name, self.binding.feed_value]];
                    let arrEventCondition;
                    if (self.binding.feed_type === 'explicit') {
                      arrEventCondition = arrExplicitEventCondition;
                    } else if (self.binding.feed_type === 'merkle') {
                      arrEventCondition = arrMerkleEventCondition;
                    } else if (self.binding.feed_type === 'either') {
                      arrEventCondition = ['or', [arrMerkleEventCondition, arrExplicitEventCondition]];
                    } else {
                      throw Error(`unknown feed type: ${self.binding.feed_type}`);
                    }
                    arrDefinition = ['or', [
                      ['and', [['address', address], arrEventCondition]],
                      ['and', [
                        ['address', myAddress], ['in data feed', [[ENV.TIMESTAMPER_ADDRESS], 'timestamp', '>', Date.now() + Math.round(self.binding.timeout * 3600 * 1000)]]
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
                    if (self.binding.feed_type === 'merkle' || self.binding.feed_type === 'either') {
                      assocSignersByPath[(self.binding.feed_type === 'merkle') ? 'r.0.1' : 'r.0.1.0'] = {
                        address: '',
                        member_signing_path: 'r',
                        device_address: recipientDeviceAddress,
                      };
                    }
                  }
                  walletDefinedByAddresses.createNewSharedAddress(arrDefinition, assocSignersByPath, {
                    ifError(err) {
                      delete self.current_payment_key;
                      indexScope.setOngoingProcess(gettextCatalog.getString('sending'), false);
                      self.setSendError(err);
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
                breadcrumbs.add(`sending payment in ${asset}`);
                profileService.bKeepUnlocked = true;

                let paymentPromise = null;

                if (indexScope.baseBalance.stable < constants.MIN_BYTE_FEE) {
                  if (!fundingExchangeClientService.active) {
                    paymentPromise = Promise.reject(gettextCatalog.getString('The Funding Client is not ready'));
                  } else {
                    paymentPromise = fundingExchangeClientService.getByteOrigin().then((sharedAddress) => {
                      console.log(`ADDRESS${sharedAddress ? ' ' : ' NOT '}SERVED BY THE FUNDING NODE`);
                      if (!sharedAddress) {
                        return Promise.reject(gettextCatalog.getString('The funding service is currently not supported on secondary wallets. Load some bytes on it'));
                      }

                      return fundingExchangeClientService.getSharedAddressBalance(sharedAddress).then((assocBalances) => {
                        console.log(`BALANCE FOR ${sharedAddress}: ${JSON.stringify(assocBalances)}`);

                        if (assocBalances.base.stable === 0 || assocBalances.base.stable < 1500) {
                          return Promise.reject(gettextCatalog.getString('Funding hub is fueling your wallet, it may take several minutes. Please try again a bit later.'));
                        }

                        opts = {
                          from_address: fundingExchangeClientService.walletAddresses,
                          main_address: fundingExchangeClientService.dagcoinOrigin,
                          shared_address: sharedAddress,
                          merkleProof,
                          asset,
                          send_all: false,
                          arrSigningDeviceAddresses,
                          recipientDeviceAddress,
                          externallyFundedPayment: true,
                          asset_outputs: [
                            {
                              address: fundingExchangeClientService.dagcoinDestination,
                              amount: constants.DAG_FEE // TODO: this is the transaction fee in micro dagcoins 1000 = 0.001 dagcoins
                            }, {
                              address: toAddress,
                              amount
                            }
                          ]
                        };

                        return Promise.resolve();
                      });
                    });
                  }
                } else {
                  paymentPromise = Promise.resolve();
                }

                let merchantPromise = null;

                // Merchant Payment life cycle
                if (self.invoiceId != null) {
                  merchantPromise = new Promise((resolve, reject) => {
                    const merchantApiRequest = require('request');

                    merchantApiRequest(`${ENV.MERCHANT_INTEGRATION_API}/${self.invoiceId}`, (error, response, body) => {
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

                paymentPromise.then(() => merchantPromise).then(() => {
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
                      delete self.current_payment_key;
                      profileService.bKeepUnlocked = false;
                      if (sendMultiPaymentError) {
                        if (sendMultiPaymentError.match(/no funded/) || sendMultiPaymentError.match(/not enough asset coins/)) {
                          error = gettextCatalog.getString('Not enough dagcoins');
                        } else if (sendMultiPaymentError.match(/connection closed/) || sendMultiPaymentError.match(/connect to light vendor failed/)) {
                          error = gettextCatalog.getString('Problems with connecting to the hub. Please try again later');
                        }
                        return self.setSendError(error);
                      }
                      const binding = self.binding;

                      if (unit != null && self.invoiceId != null) {
                        const invoiceId = self.invoiceId;
                        self.invoiceId = null;

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

                      self.resetForm();
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
                            $rootScope.$emit('Local/SetTab', 'walletHome');
                            self.openTxModal(indexScope.txHistory[0], indexScope.txHistory);
                          } else {
                            console.error('updateTxHistory not executed');
                          }
                        });
                      }
                    });
                  });
                  $scope.sendForm.$setPristine();
                }).catch((error) => {
                  delete self.current_payment_key;
                  indexScope.setOngoingProcess(gettextCatalog.getString('sending'), false);
                  $rootScope.$emit('Local/ShowAlert', error, 'fi-alert', () => {
                  });
                });
              }

              function useOrIssueNextAddress(wallet, isChange, handleAddress) {
                if (fc.isSingleAddress) {
                  handleAddress({
                    address: self.addr[fc.credentials.walletId]
                  });
                } else {
                  walletDefinedByKeys.issueNextAddress(wallet, isChange, handleAddress);
                }
              }
            });
          }, 100);
        };

        let assocDeviceAddressesByPaymentAddress = {};

        this.canSendExternalPayment = function () {
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

        this.deviceAddressIsKnown = function () {
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
              const info = { asset: b.asset };
              if (b.asset === 'base') {
                info.displayName = self.unitName;
              } else if (b.asset === ENV.DAGCOIN_ASSET) {
                info.displayName = self.dagUnitName;
              } else {
                info.displayName = `of ${b.asset.substr(0, 4)}`;
              }
              return info;
            });
            $scope.binding = { // defaults
              type: 'reverse_payment',
              timeout: 4,
              reverseAsset: ENV.DAGCOIN_ASSET,
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
          let moneyAmount = amount;
          if (asset === 'base') {
            moneyAmount *= self.unitValue;
          } else if (asset === ENV.DAGCOIN_ASSET) {
            moneyAmount *= self.dagUnitValue;
          }
          return Math.round(moneyAmount);
        }

        function getAmountInDisplayUnits(amount, asset) {
          let moneyAmount = amount;
          if (asset === 'base') {
            moneyAmount /= self.unitValue;
          } else if (asset === ENV.DAGCOIN_ASSET) {
            moneyAmount /= self.dagUnitValue;
          }
          return moneyAmount;
        }

        this.setToAddress = function (to) {
          const form = $scope.sendForm;
          if (!form || !form.address) {
            // disappeared?
            return console.log('form.address has disappeared');
          }
          form.address.$setViewValue(to);
          form.address.$isValid = true;
          form.address.$render();
        };

        this.setForm = function (to, amount, comment, asset, recipientDeviceAddress, isMerchant) {
          this.resetError();
          delete this.binding;
          const form = $scope.sendForm;
          let moneyAmount = amount;
          if (!form || !form.address) {
            // disappeared?
            return console.log('form.address has disappeared');
          }
          if (to) {
            $timeout(() => {
              form.address.$setViewValue(to);
              form.address.$isValid = true;
              form.address.$render();
            }, 100);

            if (recipientDeviceAddress) {
              // must be already paired
              assocDeviceAddressesByPaymentAddress[to] = recipientDeviceAddress;
            }
          }

          this.lockAddress = to && isMerchant;

          if (moneyAmount) {
            if (asset === 'base') {
              moneyAmount /= this.unitValue;
            }
            if (asset === ENV.DAGCOIN_ASSET) {
              moneyAmount /= this.dagUnitValue;
            }
            this.lockAmount = true;
            $timeout(() => {
              form.amount.$setViewValue(`${moneyAmount}`);
              form.amount.$isValid = true;
              form.amount.$render();
            }, 100);
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

        this.cancelForm = function (cb) {
          const invoiceId = this.invoiceId;

          if (invoiceId != null) {
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

          this.resetForm(cb);
        };

        this.resetForm = function (cb) {
          this.resetError();
          delete this.binding;

          if (this.invoiceTimeout) {
            $timeout.cancel(this.invoiceTimeout);
          }

          this.invoiceId = null;
          this.validForSeconds = null;
          this.lockAsset = false;
          this.lockAddress = false;
          this.lockAmount = false;
          this.hideAdvSend = true;
          $scope.currentSpendUnconfirmed = configService.getSync().wallet.spendUnconfirmed;

          this._amount = null;
          this._address = null;
          this.bSendAll = false;

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

        this.setSendAll = function () {
          const form = $scope.sendForm;
          if (!form || !form.amount || indexScope.arrBalances.length === 0) {
            return;
          }
          let availableDags = indexScope.dagBalance.stable;
          const availableBytes = indexScope.baseBalance.stable;

          if (availableBytes < constants.MIN_BYTE_FEE) {
            $rootScope.$emit('Local/ShowAlert', gettextCatalog.getString('You are sending all your stable amount. Transaction fee will be automatically excluded!'), 'fi-alert', () => {
              availableDags = availableDags > constants.DAG_FEE ? availableDags - constants.DAG_FEE : 0;
              availableDags /= this.dagUnitValue;
              form.amount.$setViewValue(`${availableDags}`);
              form.amount.$render();
            });
          } else {
            availableDags /= this.dagUnitValue;
            form.amount.$setViewValue(`${availableDags}`);
            form.amount.$render();
          }
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

        this.onAddressChange = function (value) {
          this.resetError();
          if (!value) return '';

          if (value.indexOf(`${self.protocol}:`) === 0) {
            return this.setFromUri(value);
          }
          return value;
        };

        // History

        function strip(number) {
          return (parseFloat(number.toPrecision(12)));
        }

        this.getUnitName = function () {
          return this.unitName;
        };

        this.checkFeeIsPayedByHub = function (btx, txHistory) {
          const fundingNodeTx = txHistory.filter(x => (x.time === btx.time && x.unit === btx.unit && x.amount === constants.DAG_FEE))[0];

          return (fundingNodeTx && btx.amount !== constants.DAG_FEE);
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

            if (self.checkFeeIsPayedByHub(btx, txHistory)) {
              $scope.feeIsPayedByHub = true;
              $scope.btx.feeStr = getAmountInDisplayUnits(constants.DAG_FEE, ENV.DAGCOIN_ASSET);
            }

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

            $scope.copyAddress = function (addr) {
              if (!addr) return;
              self.copyAddress(addr);
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
          this.setSendFormInputs();
        }
      });
}());
