(() => {
  'use strict';

  /**
   * @name DagCoin Password modal
   * @example <dag-password></dag-nav-bar>
   */
  angular
  .module('copayApp.directives')
  .directive('dagPassword', dagPassword);

  dagPassword.$inject = ['$rootScope', '$timeout', 'gettextCatalog'];

  function dagPassword($rootScope, $timeout, gettextCatalog) {
    return {
      restrict: 'E',
      transclude: true,
      replace: true,
      scope: false,
      templateUrl: 'directives/dagPassword/dagPassword.template.html',
      controllerAs: 'pass',
      controller() {
        const self = this;
        self.validationErrors = [];
        let passwordTemp;
        self.isVerification = false;
        if (self.askPassword) {
          document.getElementById('passwordInput').focus();
        }

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

        $rootScope.$on('Local/BalanceUpdatedAndWalletUnlocked', () => {
          self.walletInfoVisibility.setPasswordSuccess(true);
          $timeout(() => { $rootScope.$apply(); });
        });

        $rootScope.$on('Local/FingerprintUnlocked', () => {
          self.walletInfoVisibility.setFingerprintSuccess(true);
          $timeout(() => { $rootScope.$apply(); });
        });

        $rootScope.$on('Local/NeedsPassword', (event, isSetup, errorMessage, cb) => {
          self.askPassword = {
            isSetup,
            error: errorMessage,
            callback(err, pass) {
              self.askPassword = null;
              return cb(err, pass);
            }
          };
          $timeout(() => {
            $rootScope.$apply();
          });
        });
      }
    };
  }
})();
