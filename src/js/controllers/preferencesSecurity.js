/* eslint-disable no-shadow */
(function () {
  'use strict';

  angular.module('copayApp.controllers').controller('preferencesSecurityController',
    function ($scope, $q, $rootScope, $log, $modal, $timeout, configService, uxLanguage, pushNotificationsService, profileService,
              fingerprintService, animationService, changeWalletTypeService, gettext, gettextCatalog) {
      const conf = require('byteballcore/conf.js');
      const self = this;
      self.isLight = conf.bLight;
      self.canChangeWalletType = changeWalletTypeService.canChange();
      $scope.encrypt = !!profileService.profile.xPrivKeyEncrypted;

      this.init = function () {
        const config = configService.getSync();
        this.type = conf.bLight ? gettextCatalog.getString('light wallet') : gettextCatalog.getString('full wallet');
        this.unitName = config.wallet.settings.unitName;
        this.deviceName = config.deviceName;
        this.myDeviceAddress = require('byteballcore/device.js').getMyDeviceAddress();
        this.hub = config.hub;
        this.currentLanguageName = uxLanguage.getCurrentLanguageName();
        this.torEnabled = conf.socksHost && conf.socksPort;
        this.touchidAvailable = fingerprintService.isAvailable();
        config.touchIdFor = config.touchIdFor || {};
        $scope.touchid = !!config.touchIdFor[profileService.focusedClient.credentials.walletId];
        $scope.pushNotifications = config.pushNotifications.enabled;
      };

      const unwatchPushNotifications = $scope.$watch('pushNotifications', (newVal, oldVal) => {
        if (newVal === oldVal) return;
        const opts = {
          pushNotifications: {
            enabled: newVal,
          },
        };
        configService.set(opts, (err) => {
          if (opts.pushNotifications.enabled) {
            pushNotificationsService.pushNotificationsInit();
          } else {
            pushNotificationsService.pushNotificationsUnregister();
          }
          if (err) $log.debug(err);
        });
      });

      function lock() {
        $rootScope.$emit('Local/NeedsPassword', true, null, (err, password) => {
          if (err && !password) {
            $scope.encrypt = false;
            return;
          }
          profileService.setPrivateKeyEncryptionFC(password, () => {
            $rootScope.$emit('Local/NewEncryptionSetting');
            $scope.encrypt = true;
          });
        });
      }

      function unlock(error) {
        profileService.unlockFC(error, (err) => {
          if (err) {
            $scope.encrypt = true;

            if (err.message !== gettextCatalog.getString('Password needed')) {
              return unlock(err.message);
            }
            return;
          }
          profileService.disablePrivateKeyEncryptionFC((disablePrivateKeyEncryptionFCError) => {
            $rootScope.$emit('Local/NewEncryptionSetting');
            if (disablePrivateKeyEncryptionFCError) {
              $scope.encrypt = true;
              $log.error(disablePrivateKeyEncryptionFCError);
              return;
            }
            $scope.encrypt = false;
          });
        });
      }

      const unwatchEncrypt = $scope.$watch('encrypt', (val) => {
        const fc = profileService.focusedClient;

        if (!fc) {
          return;
        }

        if (val && !fc.hasPrivKeyEncrypted()) {
          $scope.touchid = false;
          lock();
        } else if (!val && fc.hasPrivKeyEncrypted()) {
          unlock();
        }
      });

      const unwatchRequestTouchid = $scope.$watch('touchid', (newVal, oldVal) => {
        if (newVal === oldVal || $scope.touchidError) {
          $scope.touchidError = false;
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
              $scope.touchidError = true;
              $scope.touchid = oldVal;
            }, 100);
          }
          $scope.encrypt = false;
          configService.set(opts, (configServiceError) => {
            if (configServiceError) {
              $log.debug(configServiceError);
              $scope.touchidError = true;
              $scope.touchid = oldVal;
            }
          });
        });
      });

      $scope.$on('$destroy', () => {
        unwatchPushNotifications();
        unwatchEncrypt();
        unwatchRequestTouchid();
      });

      self.changeWalletType = function () {
        if (self.isLight) {
          const ModalInstanceCtrl = function ($scopeModal, $modalInstance, $sce) {
            $scopeModal.header = $sce.trustAsHtml(gettextCatalog.getString('Change wallet type!'));
            $scopeModal.title = $sce.trustAsHtml(gettextCatalog.getString(`The wallet will contain the most current state of the entire Dagcoin database.
            This option is better for privacy but will take several gigabytes of storage and the initial sync will take several days.
            CPU load will be high during sync. After changing to full wallet your money won't be visible until database will synchronize your transactions.`));

            $scopeModal.yes_label = gettextCatalog.getString('Change it');
            $scopeModal.ok = function () {
              $modalInstance.close(true);
            };
            $scopeModal.cancel = function () {
              $modalInstance.dismiss('cancel');
            };
          };

          const modalInstance = $modal.open({
            templateUrl: 'views/modals/confirmation.html',
            windowClass: animationService.modalAnimated.slideUp,
            controller: ['$scope', '$modalInstance', '$sce', ModalInstanceCtrl],
          });

          modalInstance.result.finally(() => {
            const m = angular.element(document.getElementsByClassName('reveal-modal'));
            m.addClass(animationService.modalAnimated.slideOutDown);
          });

          modalInstance.result.then((ok) => {
            if (ok) {
              changeWalletTypeService.change();
            }
          });
        } else {
          changeWalletTypeService.change();
        }
      };
    });
}());
