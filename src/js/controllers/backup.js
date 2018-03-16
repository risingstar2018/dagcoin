(function () {
  'use strict';

  angular.module('copayApp.controllers').controller('wordsController',
    function ($rootScope, $scope, $timeout, profileService, go, gettextCatalog, confirmDialog, notification, $log, isCordova, configService) {
      const msg = gettextCatalog.getString('Are you sure you want to delete the backup words?');
      const successMsg = gettextCatalog.getString('Backup words deleted');
      const self = this;
      self.show = false;

      const config = configService.getSync();
      const fc = profileService.focusedClient;

      const needPassword = !!profileService.profile.xPrivKeyEncrypted;
      const needFingerprint = !!config.touchId;
      self.needAuth = needPassword || needFingerprint;
      self.deleted = fc.credentials && !fc.credentials.mnemonicEncrypted && !fc.credentials.mnemonic;

      if (isCordova) {
        self.text = gettextCatalog.getString(`To protect your funds, please use multisig wallets with redundancy, 
          e.g. 1-of-2 wallet with one key on this device and another key on your laptop computer. 
          Just the wallet seed is not enough.`);
      } else {
        const desktopApp = require('byteballcore/desktop_app.js');
        const appDataDir = desktopApp.getAppDataDir();
        self.text = gettextCatalog.getString(`To restore your wallets, you will need a full backup of Dagcoin data at ${appDataDir}.  
                     Better yet, use multisig wallets with redundancy, 
                     e.g. 1-of-2 wallet with one key on this device and another key on your smartphone.  
                     Just the wallet seed is not enough.`);
      }

      if (!self.needAuth) {
        setWords(fc.getMnemonic());
      }

      self.toggle = function () {
        self.error = '';
        if (!self.needAuth) {
          self.show = !self.show;
        } else if (needPassword) {
          self.passwordRequest();
        } else if (needFingerprint) {
          self.fingerprintRequest();
        }

        $timeout(() => {
          $scope.$apply();
        }, 1);
      };

      self.delete = function () {
        confirmDialog.show(msg, (ok) => {
          if (ok) {
            fc.clearMnemonic();
            profileService.clearMnemonic(() => {
              self.deleted = true;
              $rootScope.$emit('Local/BackupDone');
              notification.success(successMsg);
              go.walletHome();
            });
          }
        });
      };

      $scope.$on('$destroy', () => {
        profileService.lockFC();
      });

      function setWords(words) {
        if (words) {
          self.mnemonicWords = words.split(/[\u3000\s]+/);
          self.mnemonicHasPassphrase = fc.mnemonicHasPassphrase();
          self.useIdeograms = words.indexOf('\u3000') >= 0;
          self.mnemonicWordsJoined = self.mnemonicWords.join(' ');
        }
      }

      self.unlock = function () {
        profileService.unlockFC(null, (err) => {
          if (err) {
            self.error = `${gettextCatalog.getString('Could not decrypt')}: ${err.message}`;
            $log.warn('Error decrypting credentials:', self.error); // TODO
            return;
          }
          this.successUnlock();
        });
      };

      self.successUnlock = function () {
        if (!self.show && self.needAuth) {
          self.show = !self.show;
        }
        self.needAuth = false;
        setWords(fc.getMnemonic());
        $rootScope.$emit('Local/BackupDone');
      };

      self.passwordRequest = function () {
        try {
          self.unlock();
        } catch (e) {
          if (e.message && e.message.match(/encrypted/) && !!profileService.profile.xPrivKeyEncrypted) {
            self.needAuth = true;

            $timeout(() => {
              $scope.$apply();
            }, 1);

            self.unlock();
          }
        }
      };

      self.fingerprintRequest = function () {
        profileService.requestTouchid(null, (err) => {
          if (!err) {
            this.successUnlock();
          }
        });
      };
    });
}());
