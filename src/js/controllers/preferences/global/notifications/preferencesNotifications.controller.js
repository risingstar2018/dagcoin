(function () {
  'use strict';

  angular.module('copayApp.controllers').controller('PreferencesNotificationsCtrl',
    function ($scope, $q, $rootScope, $log, $modal, configService, uxLanguage, pushNotificationsService, lodash, gettextCatalog) {
      const vm = this;
      $scope.pushNotifications = false;

      vm.init = function () {
        const config = configService.getSync();
        $scope.pushNotifications = pushNotificationsService.pushIsAvailableOnSystem && config.pushNotifications.enabledNew;
      };

      let unwatchPushNotifications = $scope.$watch('pushNotifications', watchPushNotifications);

      function watchPushNotifications(newVal, oldVal) {
        if (newVal === oldVal) {
          return;
        }
        const opts = { pushNotifications: { enabledNew: newVal } };
        if (newVal) {
          pushNotificationsService.pushNotificationsRegister((registrationId, err) => {
            setPushNotificationSwitch(opts, registrationId, err);
          });
        } else {
          pushNotificationsService.pushNotificationsUnregister((registrationId, err) => {
            setPushNotificationSwitch(opts, registrationId, err);
          });
        }
      }

      /**
       *
       * @param opts
       * @param registrationId In case of failure registrationId is empty (null or undefined)
       * @param err In case of success err is empty
       */
      function setPushNotificationSwitch(opts, registrationId, err) {
        if (lodash.isEmpty(err)) {
          configService.set(opts, (errInSet) => {
            if (errInSet) {
              $log.debug(errInSet);
              $rootScope.$emit('Local/ShowAlert', errInSet, 'fi-alert', () => { });
              revertPushNotificationCheck();
            } else {
              $rootScope.$emit('Local/ShowAlert',
                opts.pushNotifications.enabledNew ?
                  gettextCatalog.getString('Push Notifications enabled.') :
                  gettextCatalog.getString('Push Notifications disabled.'),
                'fi-check', () => { });
            }
          });
        } else {
          revertPushNotificationCheck();
          $rootScope.$emit('Local/ShowAlert', err, 'fi-alert', () => { });
        }
      }

      // TODO shoud be proper way to revert value in $watch method
      function revertPushNotificationCheck() {
        unwatchPushNotifications();
        $scope.pushNotifications = !$scope.pushNotifications;
        unwatchPushNotifications = $scope.$watch('pushNotifications', watchPushNotifications);
      }

      $scope.$on('$destroy', () => {
        unwatchPushNotifications();
      });
    });
}());
