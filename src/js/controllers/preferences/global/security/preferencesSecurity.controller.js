(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('PreferencesSecurityCtrl', PreferencesSecurityCtrl);

  PreferencesSecurityCtrl.$inject = ['$scope', '$rootScope', '$log', '$timeout', 'configService', 'profileService',
    'fingerprintService', 'sharedService', 'gettextCatalog', '$q'];

  function PreferencesSecurityCtrl($scope, $rootScope, $log, $timeout, configService, profileService,
                                   fingerprintService, sharedService, gettextCatalog, $q) {
    const vm = this;
    const config = configService.getSync();
    vm.encrypt = profileService.profile && profileService.profile.xPrivKeyEncrypted && !!profileService.profile.xPrivKeyEncrypted;
    vm.touchidAvailable = fingerprintService.isAvailable();
    vm.touchid = !!config.touchId;
    vm.enableShowReceiveOnPassword = config.enableShowReceiveOnPassword;

    const unwatchEncrypt = $scope.$watch('security.encrypt', (val) => {
      const fc = profileService.focusedClient;
      sharedService.showClickToReceiveLink = false;
      if (!fc) {
        return;
      }

      if (val && !fc.hasPrivKeyEncrypted()) {
        lock();
      } else if (!val && fc.hasPrivKeyEncrypted()) {
        unlock();
      }
    });

    const unwatchEnableShowReceiveOnPassword = $scope.$watch('security.enableShowReceiveOnPassword', (val) => {
      const opts = {
        enableShowReceiveOnPassword: val
      };
      configService.set(opts, (err) => {
        if (err) {
          $rootScope.$emit('Local/ShowAlert', JSON.stringify(err), 'fi-alert', () => { });
        }
      });
    });

    const unwatchRequestTouchid = $scope.$watch('security.touchid', (newVal, oldVal) => {
      if (newVal === oldVal || $scope.touchidError) {
        vm.touchidError = false;
        return;
      }
      const opts = {
        touchId: null,
      };
      opts.touchId = newVal;

      profileService.requestTouchid('unlockingApp', (err) => {
        if (err) {
          $log.debug(err);
          $timeout(() => {
            vm.touchidError = true;
            vm.touchid = oldVal;
          }, 100);
        }
        configService.set(opts, (configServiceError) => {
          if (configServiceError) {
            $log.debug(configServiceError);
            vm.touchidError = true;
            vm.touchid = oldVal;
          }
          if (vm.encrypt && !oldVal) {
            vm.touchid = false;
            unlock().then((locked) => {
              if (!locked) {
                vm.touchid = true;
              }
            });
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
          if (vm.touchid) {
            vm.touchid = false;
          }
        });
      });
    }

    function unlock(error) {
      const def = $q.defer();
      profileService.unlockFC(error, (err) => {
        if (err) {
          vm.encrypt = true;

          if (err.message !== gettextCatalog.getString('Password needed')) {
            return unlock(err.message).then((locked) => {
              def.resolve(locked);
            });
          }
          def.resolve(true);
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
          def.resolve(false);
        });
      });
      return def.promise;
    }

    $scope.$on('$destroy', () => {
      unwatchEncrypt();
      unwatchEnableShowReceiveOnPassword();
      unwatchRequestTouchid();
    });
  }
})();
