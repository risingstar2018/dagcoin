/* eslint-disable no-undef */
(() => {
  'use strict';

  /**
   * @name DagCoin Password modal
   * @example <dag-password></dag-nav-bar>
   */
  angular
  .module('copayApp.directives')
  .directive('dagPassword', dagPassword);

  dagPassword.$inject = ['$rootScope', '$timeout', '$modalStack', 'go', 'gettextCatalog', 'configService',
    'profileService', 'sharedService'];

  function dagPassword($rootScope, $timeout, $modalStack, go, gettextCatalog, configService, profileService, sharedService) {
    return {
      restrict: 'E',
      transclude: true,
      replace: true,
      scope: false,
      templateUrl: 'directives/dagPassword/dagPassword.template.html',
      controllerAs: 'pass',
      controller() {
        const self = this;
        let passwordTemp;
        // This property is assigned to an empty object to escape from null pointer access.
        // This is initialized in Local/ProfileBound event
        self.walletInfoVisibility = {};
        self.validationErrors = [];
        self.password = '';
        self.isVerification = false;
        self.passwordVisible = false;

        self.close = cb => cb('No password given');

        self.set = function (isSetup, cb) {
          self.error = false;
          if (isSetup && !self.isVerification) {
            document.getElementById('passwordInput').focus();
            self.isVerification = true;
            passwordTemp = self.password;
            self.password = null;
            $timeout(() => {
              $rootScope.$apply();
            });
            return;
          }
          if (isSetup) {
            if (passwordTemp !== self.password) {
              self.error = gettextCatalog.getString('Passwords do not match');
              return;
            }
          }
          cb(null, self.password);
        };

        self.validate = function () {
          self.validationErrors = [];
          if (self.password.length < 8) {
            self.validationErrors.push(gettextCatalog.getString('Password must be at least 8 characters long'));
          }
          if (self.password.search(/[a-z]/i) < 0) {
            self.validationErrors.push(gettextCatalog.getString('Password must contain at least one letter'));
          }
          if (self.password.search(/[0-9]/) < 0) {
            self.validationErrors.push(gettextCatalog.getString('Password must contain at least one digit'));
          }
          if (self.password.search(/[!@#$%^&*]/) < 0) {
            self.validationErrors.push(gettextCatalog.getString('Password must contain at least one special character'));
          }
          return self.validationErrors.length <= 0;
        };

        self.showReceive = function () {
          self.walletInfoVisibility.justShowReceive = true;
          // const ap = self.askPassword;
          self.askPassword = null;
          go.path('wallet.receive', () => {
            sharedService.askPasswordDisabledTemporarilyForReceive = true;
            sharedService.inJustShowReceiveAddressMode = true;
          });
        };

        $rootScope.$on('Local/BalanceUpdatedAndWalletUnlocked', () => {
          self.walletInfoVisibility.setPasswordSuccess(true);
          $timeout(() => { $rootScope.$apply(); });
        });

        $rootScope.$on('Local/FingerprintUnlocked', () => {
          self.walletInfoVisibility.setFingerprintSuccess(true);
          $timeout(() => { $rootScope.$apply(); });
        });

        $rootScope.$on('Local/NeedsPassword', (event, isSetup, errorMessage, cb) => {
          // Clear password field
          self.password = '';

          self.askPassword = {
            isSetup,
            error: errorMessage,
            callback(err, pass) {
              self.askPassword = null;
              return cb(err, pass);
            }
          };
          // to display password modal immediately
          $timeout(() => {
            $rootScope.$apply();
          });
        });

        /**
         * When click to received is clicked, some variables are set.
         * If any restricted page is clicked password is requested again. In this case
         * all variables according to click to receive event must be reset.
         */
        $rootScope.$on('Local/ResetVisibility', () => {
          sharedService.askPasswordDisabledTemporarilyForReceive = null;
          sharedService.inJustShowReceiveAddressMode = null;
          self.walletInfoVisibility.justShowReceive = null;
        });

        $timeout(() => {
          $rootScope.$apply();
        });

        /**
         * Event that triggers when application starts.
         * When this is trigger all services initialized and initialization are ready.
         */
        $rootScope.$on('Local/ProfileBound', () => {
          const config = configService.getSync();
          // password and finger print options are read from config and profile service
          const needPassword = !!profileService.profile.xPrivKeyEncrypted;
          const needFingerprint = !!config.touchId;

          if (!(self.walletInfoVisibility instanceof WalletInfoVisibility)) {
            self.walletInfoVisibility = new WalletInfoVisibility(needPassword, needFingerprint);
          }
          self.showReceiveOnPassword = config.enableShowReceiveOnPassword;
        });
      }
    };
  }
})();
