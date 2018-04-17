/* eslint-disable no-use-before-define,no-shadow */
(function () {
  'use strict';

  angular.module('copayApp.services').factory('transactionsService', (lodash, ENV, utilityService, profileService,
                                                                      addressbookService, animationService, correspondentListService,
                                                                      gettextCatalog, $rootScope, $modal, txFormatService,
                                                                      notification, configService) => {
    const root = {};
    const breadcrumbs = require('core/breadcrumbs.js');

    /**
     * This will be moved into tx directive
     * @param param {*} is an object that has properties
     *  btx transaction
     *  walletSettings can be get from configService.getSync().wallet.settings
     *  indexScope $scope.indexScope
     *  showMakeNewPayment if true MakeNewPayment button is displayed
     */
    root.openTxModal = function (params) {
      const btx = params.btx;

      // fix fee value
      if (btx.action !== 'received' && (typeof btx.feeStr === 'string')) {
        const feeVal = btx.feeStr.split(' ')[0] || 0;
        const config = configService.getSync();
        btx.feeStr = feeVal / config.wallet.settings.unitValue;
      }

      const walletSettings = params.walletSettings;
      $rootScope.modalOpened = true;
      const ModalInstanceCtrl = function ($scope, $modalInstance) {
        $scope.btx = btx;
        $scope.settings = walletSettings;
        $scope.isCordova = utilityService.isCordova;
        $scope.showMakeNewPayment = params.showMakeNewPayment;

        $scope.transactionAddress = function (address) {
          return root.getTransactionAddress(address);
        };

        $scope.openInExplorer = function () {
          const url = `https://${ENV.explorerUrl}/#${btx.unit}`;
          if (typeof nw !== 'undefined') {
            // todo: we already have method for this
            nw.Shell.openExternal(url);
          } else if (utilityService.isCordova) {
            cordova.InAppBrowser.open(url, '_system');
          }
        };

        $scope.copyAddress = function (address) {
          utilityService.copyAddress($scope, address);
        };

        $scope.cancel = function () {
          breadcrumbs.add('dismiss tx details');
          try {
            $modalInstance.dismiss('cancel');
          } catch (e) {
            // continue regardless of error
          }
        };

        $scope.makeNewPayment = function () {
          const amount = btx.amount;
          let receiverAddress;
          if (btx.action === 'received') {
            receiverAddress = btx.arrPayerAddresses[0];
          } else if (btx.action === 'sent' || btx.action === 'moved') {
            receiverAddress = btx.addressTo;
          }
          $modalInstance.dismiss('done');
          $rootScope.$emit('paymentRequest', receiverAddress, amount, 'base');
        };
      };

      const modalInstance = $modal.open({
        templateUrl: 'views/modals/tx-details.html',
        windowClass: animationService.modalAnimated.slideUp,
        controller: ModalInstanceCtrl
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

    root.showCorrespondentListToReSendPrivPayloads = function (btx, walletSettings) {
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
          const indivisibleAsset = require('core/indivisible_asset');
          const walletGeneral = require('core/wallet_general');
          indivisibleAsset.restorePrivateChains(btx.asset, btx.unit, btx.addressTo, (arrRecipientChains) => {
            walletGeneral.sendPrivatePayments(correspondent.device_address, arrRecipientChains, true, null, () => {
              modalInstance.dismiss('cancel');
              go.walletHome();
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

    root.getTransactionAddress = (address) => {
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

    root.getTransactionStatus = (transaction) => {
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

    root.processNewTxs = (txs) => {
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

    root.checkTransactionsAreConfirmed = (oldHistory, newHistory) => {
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

    return root;
  });
}());
