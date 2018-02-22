(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('PreferencesSecurityCtrl', PreferencesSecurityCtrl);

  PreferencesSecurityCtrl.$inject = ['$scope', '$rootScope', '$log', '$timeout', 'configService', 'profileService', 'fingerprintService', 'gettextCatalog'];

  function PreferencesSecurityCtrl($scope, $rootScope, $log, $timeout, configService, profileService, fingerprintService, gettextCatalog) {
    const vm = this;
    const config = configService.getSync();
    config.touchIdFor = config.touchIdFor || {};
    vm.encrypt = !!profileService.profile.xPrivKeyEncrypted;
    vm.touchidAvailable = fingerprintService.isAvailable();
    vm.touchid = !!config.touchIdFor[profileService.focusedClient.credentials.walletId];

    const unwatchEncrypt = $scope.$watch('encrypt', (val) => {
      const fc = profileService.focusedClient;

      if (!fc) {
        return;
      }

      if (val && !fc.hasPrivKeyEncrypted()) {
        vm.touchid = false;
        lock();
      } else if (!val && fc.hasPrivKeyEncrypted()) {
        unlock();
      }
    });

    const unwatchRequestTouchid = $scope.$watch('touchid', (newVal, oldVal) => {
      if (newVal === oldVal || $scope.touchidError) {
        vm.touchidError = false;
        return;
      }
      const walletId = profileService.focusedClient.credentials.walletId;

      const opts = {
        touchIdFor: {},
      };
      opts.touchIdFor[walletId] = newVal;

      profileService.requestTouchid('unlockingApp', (err) => {
        if (err) {
          $log.debug(err);
          $timeout(() => {
            vm.touchidError = true;
            vm.touchid = oldVal;
          }, 100);
        }
        vm.encrypt = false;
        configService.set(opts, (configServiceError) => {
          if (configServiceError) {
            $log.debug(configServiceError);
            vm.touchidError = true;
            vm.touchid = oldVal;
          }
        });
      });
    });


    function lock() {
      $rootScope.$emit('Local/NeedsPassword', true, null, (err, password) => {
        if (err && !password) {
          vm.encrypt = false;
          return;
        }
        profileService.setPrivateKeyEncryptionFC(password, () => {
          $rootScope.$emit('Local/NewEncryptionSetting');
          vm.encrypt = true;
        });
      });
    }

    function unlock(error) {
      profileService.unlockFC(error, (err) => {
        if (err) {
          vm.encrypt = true;

          if (err.message !== gettextCatalog.getString('Password needed')) {
            return unlock(err.message);
          }
          return;
        }
        profileService.disablePrivateKeyEncryptionFC((disablePrivateKeyEncryptionFCError) => {
          $rootScope.$emit('Local/NewEncryptionSetting');
          if (disablePrivateKeyEncryptionFCError) {
            vm.encrypt = true;
            $log.error(disablePrivateKeyEncryptionFCError);
            return;
          }
          vm.encrypt = false;
        });
      });
    }

    $scope.$on('$destroy', () => {
      unwatchEncrypt();
      unwatchRequestTouchid();
    });
  }
})();
