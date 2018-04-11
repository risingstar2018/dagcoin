/* eslint-disable no-unused-vars */
/**
 * Supporter class for indexController.
 * It adds listeners of eventBus
 */
function IndexEventsSupport(params) {
  const eventBus = require('core/event_bus.js');
  const breadcrumbs = require('core/breadcrumbs.js');
  const Device = params.Device;
  const Raven = params.Raven;
  const go = params.go;
  const $rootScope = params.$rootScope;
  const changeWalletTypeService = params.changeWalletTypeService;

  // self is indexController
  const self = params.self;
  const $timeout = params.$timeout;
  const profileService = params.profileService;
  const notification = params.notification;
  const gettextCatalog = params.gettextCatalog;
  const newVersion = params.newVersion;
  const isCordova = Device.cordova;
  self.catchupBallsAtStart = -1;

  this.initNotFatalError = (cb) => {
    eventBus.on('nonfatal_error', (errorMessage, errorObject) => {
      console.log('nonfatal error stack', errorObject.stack);
      Raven.captureException(`nonfatal error stack ${errorMessage}`);
      errorObject.bIgnore = true;
      if (cb) cb();
    });
  };

  this.initUncaughtError = (cb) => {
    eventBus.on('uncaught_error', (errorMessage, errorObject) => {
      Raven.captureException(errorMessage);
      if (errorMessage.indexOf('ECONNREFUSED') >= 0 || errorMessage.indexOf('host is unreachable') >= 0) {
        $rootScope.$emit('Local/ShowAlert', 'Error connecting to TOR', 'fi-alert', () => {
          go.path('preferencesTor');
        });
        return;
      }
      if (errorMessage.indexOf('ttl expired') >= 0 || errorMessage.indexOf('general SOCKS server failure') >= 0) {
        // TOR error after wakeup from sleep
        return;
      }

      const handled = changeWalletTypeService.tryHandleError(errorObject);
      if (errorObject && (errorObject.bIgnore || handled)) {
        return;
      }
      self.showErrorPopup(errorMessage, () => {
        if (isCordova && navigator && navigator.app) {
          // android
          navigator.app.exitApp();
        } else if (process.exit) {
          // nwjs
          process.exit();
        }
        // ios doesn't exit
      });
      if (cb) cb();
    });
  };
  this.initCatchingUpStarted = (cb) => {
    eventBus.on('catching_up_started', () => {
      self.setOngoingProcess('Syncing', true);
      self.syncProgress = '0% of new units';
      if (cb) cb();
    });
  };
  this.initCatchupBallsLeft = (cb) => {
    eventBus.on('catchup_balls_left', (countLeft) => {
      self.setOngoingProcess('Syncing', true);
      if (self.catchupBallsAtStart === -1) {
        self.catchupBallsAtStart = countLeft;
      }
      const percent = Math.round(((self.catchupBallsAtStart - countLeft) / self.catchupBallsAtStart) * 100);
      self.syncProgress = `${percent}% of new units`;
      $timeout(() => {
        $rootScope.$apply();
      });
      if (cb) cb();
    });
  };
  this.initCatchingUpDone = (cb) => {
    self.catchupBallsAtStart = -1;
    self.setOngoingProcess('Syncing', false);
    self.syncProgress = '';
    if (cb) cb();
  };
  this.initRefreshLightStarted = (cb) => {
    eventBus.on('refresh_light_started', () => {
      console.log('refresh_light_started');
      self.setOngoingProcess('Syncing', true);
      if (cb) cb();
    });
  };
  this.initRefreshLightDone = (cb) => {
    eventBus.on('refresh_light_done', () => {
      console.log('refresh_light_done');
      self.setOngoingProcess('Syncing', false);
      newVersion.askForVersion();
      if (cb) cb();
    });
  };
  this.initRefusedToSign = (cb) => {
    eventBus.on('refused_to_sign', (deviceAddress) => {
      const device = require('core/device.js');
      device.readCorrespondent(deviceAddress, (correspondent) => {
        notification.success(gettextCatalog.getString('Refused'), gettextCatalog.getString(`${correspondent.name} refused to sign the transaction`));
      });
      if (cb) cb();
    });
  };

  this.initNewMyTransactions = (cb) => {
    eventBus.on('new_my_transactions', () => {
      breadcrumbs.add('new_my_transactions');
      self.updateAll();
      self.updateTxHistory();
      if (cb) cb();
    });
  };
  this.initMyTransactionsBecameStable = (cb) => {
    eventBus.on('my_transactions_became_stable', () => {
      breadcrumbs.add('my_transactions_became_stable');
      self.updateAll();
      self.updateTxHistory();
      if (cb) cb();
    });
  };
  this.initMciBecameStable = (cb) => {
    eventBus.on('mci_became_stable', () => {
      breadcrumbs.add('mci_became_stable');
      self.updateAll();
      self.updateTxHistory();
      if (cb) cb();
    });
  };
  this.initMaybeNewTransactions = (cb) => {
    eventBus.on('maybe_new_transactions', () => {
      breadcrumbs.add('maybe_new_transainitWalletDeclinedctions');
      self.updateAll();
      self.updateTxHistory();
      if (cb) cb();
    });
  };
  this.initWalletApproved = (cb) => {
    eventBus.on('wallet_approved', (walletId, deviceAddress) => {
      console.log(`wallet_approved ${walletId} by ${deviceAddress}`);
      const client = profileService.walletClients[walletId];
      // already deleted (maybe declined by another device) or not present yet
      if (!client) {
        return;
      }
      const walletName = client.credentials.walletName;
      profileService.updatePublicKeyRing(client);
      const device = require('core/device.js');
      device.readCorrespondent(deviceAddress, (correspondent) => {
        notification.success(gettextCatalog.getString('Success'), gettextCatalog.getString(`Wallet ${walletName} approved by ${correspondent.name}`));
      });
      if (cb) cb();
    });
  };

  this.initWalletDeclined = (cb) => {
    eventBus.on('wallet_declined', (walletId, deviceAddress) => {
      const client = profileService.walletClients[walletId];
      // already deleted (maybe declined by another device)
      if (!client) {
        return;
      }
      const walletName = client.credentials.walletName;
      const device = require('core/device.js');
      device.readCorrespondent(deviceAddress, (correspondent) => {
        notification.info(gettextCatalog.getString('Declined'), gettextCatalog.getString(`Wallet ${walletName} declined by ${correspondent.name}`));
      });
      profileService.deleteWallet({ client }, (err) => {
        if (err) {
          console.log(err);
        }
      });
      if (cb) cb();
    });
  };
  this.initWalletCompleted = (cb) => {
    eventBus.on('wallet_completed', (walletId) => {
      console.log(`wallet_completed ${walletId}`);
      const client = profileService.walletClients[walletId];
      if (!client) {
        return;
      } // impossible
      const walletName = client.credentials.walletName;
      profileService.updatePublicKeyRing(client, () => {
        if (!client.isComplete()) {
          throw Error('not complete');
        }
        notification.success(gettextCatalog.getString('Success'), gettextCatalog.getString(`Wallet ${walletName} is ready`));
        $rootScope.$emit('Local/WalletCompleted');
      });
      if (cb) cb();
    });
  };
  this.initConfirmOnOtherDevice = () => {
    eventBus.on('confirm_on_other_devices', () => {
      $rootScope.$emit('Local/ShowAlert', 'Transaction created.', 'fi-key', () => {
        go.walletHome();
      });
    });
  };
}
