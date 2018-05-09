/**
 * In order to run push notifications properly, the settings located in hub's conf.js file must be set
 * https://console.cloud.google.com
 * user:registered user, project:assigned project (differs test and live)
 * exports.pushApiProjectNumber = ... //Project Settings -> Project Number
 * exports.pushApiKey = '.....'; //API Key -> Server key (auto created by Google Service)
 *
 * The projectNumber setting in ENV have to be the same with the project number in hub's conf.js file
 */
(function () {
  'use strict';

  /* eslint-disable no-shadow */
  /* global PushNotification */
  angular.module('copayApp.services')
  .factory('pushNotificationsService', ($http, $rootScope, $log, storageService, lodash, Device,
                                        configService, $timeout, $state, ENV) => {
    const root = {};
    const usePushNotifications = Device.cordova && !Device.windows;
    const constants = require('core/constants.js');
    const isProduction = !constants.version.match(/t$/);

    // For now if system is in product push notifications disabled.
    // After product hub is established remove !isProduction control.
    root.pushIsAvailableOnSystem = usePushNotifications && !isProduction;
    root.pushProjectNumberReceived = false;

    let projectNumber;
    let wsLocal;

    const eventBus = require('core/event_bus.js');
    const pushNotificationWrapper = new PushNotificationWrapper(usePushNotifications);

    eventBus.on('receivedPushProjectNumber', (ws, data) => {
      $log.info(`receivedPushProjectNumber: ${data.projectNumber}`);
      wsLocal = ws;
      if (data && data.projectNumber !== undefined) {
        projectNumber = `${data.projectNumber}`;

        if (projectNumber === ENV.projectNumber) {
          $rootScope.$emit('Local/ReceivedPushProjectNumber', projectNumber);
        }

        storageService.getPushInfo((err, pushInfo) => {
          // projectNumber must be same with ENV.projectNumber
          if (pushInfo && projectNumber !== ENV.projectNumber) {
            root.pushNotificationsUnregister(() => { });
          } else if (projectNumber === ENV.projectNumber) {
            root.pushProjectNumberReceived = true;
            const config = configService.getSync();
            if (config.pushNotifications.enabledNew) {
              $log.info('pushNotification is being initialized');
              pushNotificationWrapper.init();
            }
          }
        });
      }
    });

    root.pushNotificationsUnregister = function (cb) {
      pushNotificationWrapper.unregister(cb);
    };

    root.pushNotificationsRegister = function (cb) {
      pushNotificationWrapper.init(cb);
    };

    root.isPushProjectNumberReceived = () => root.pushProjectNumberReceived;

    /**
     *
     * @param pushIsAvailableOnSystem if false push notifications calls like as mock, do nothing
     * @constructor
     */
    function PushNotificationWrapper(pushIsAvailableOnSystem) {
      this.pushIsAvailableOnSystem = pushIsAvailableOnSystem;
      this.push = null;

      root.available = false;

      /**
       * If push is disabled by user, this method has no effect.
       * In order to available push notifications available pushIsAvailableOnSystem and PushNotification plugin must
       * exists in application.
       * @param cb Callback function gets registrationId as parameter
       */
      this.init = (cb) => {
        root.available = this.pushIsAvailableOnSystem && typeof PushNotification !== 'undefined';
        if (root.available) {
          this.push = PushNotification.init({
            android: {
            },
            browser: {
              pushServiceURL: 'http://push.api.phonegap.com/v1/push'
            },
            ios: {
              alert: 'true',
              badge: 'true',
              sound: 'true'
            },
            windows: {}
          });
          $log.info('registering push notifications');
          this.push.on('registration', onRegistration(cb));
          this.push.on('notification', onNotification);
          this.push.on('error', (e) => {
            // e members: message
            $log.error(`Push Notification Error: ${e.message}`);
          });
        } else {
          $log.warn('Push notifications are not available on system');
        }
      };

      /**
       * If the device is not available for push notifications, nothing happens
       * @param cb Callback function gets registrationId as first parameter, second is err [string]
       */
      this.unregister = (cb) => {
        if (!root.available) {
          cb(null, 'Push notifications are not available');
          return;
        }
        $log.debug('Unregistering push notifications');
        disableNotification(cb);
      };
    }

    /**
     *
     * @param ws
     * @param registrationId
     * @param cb Callback function gets registrationId as first parameter, second is err [string]
     */
    function sendRequestEnableNotification(ws, registrationId, cb) {
      const cbForSendRequest = lodash.isFunction(cb) ? cb : () => { };
      const network = require('core/network.js');
      network.sendRequest(ws, 'hub/enable_notification', registrationId, false, (ws, request, response) => {
        if (!response || (response && response !== 'ok')) {
          cbForSendRequest(null, 'Error sending push info');
          return $log.error('Error sending push info');
        }
        cbForSendRequest(registrationId);
      });
    }

    /**
     *
     * @param cb Callback function gets registrationId as first parameter, second is err [string]
     */
    function disableNotification(cb) {
      const cbForSendRequest = lodash.isFunction(cb) ? cb : () => { };
      if (lodash.isEmpty(wsLocal)) {
        cbForSendRequest(null, 'ws can not be retrieved yet');
        return;
      }
      storageService.getPushInfo((err, pushInfo) => {
        if (!pushInfo || !pushInfo.registrationId) {
          const err = 'pushInfo unregister problem :: pushInfo or pushInfo.registrationId is undefined or null. Please try later.';
          cbForSendRequest(null, err);
          console.error(err);
          return;
        }
        storageService.removePushInfo(() => {
          const network = require('core/network.js');
          network.sendRequest(wsLocal, 'hub/disable_notification', pushInfo.registrationId, false, (ws, request, response) => {
            if (!response || (response && response !== 'ok')) {
              cbForSendRequest(null, 'Error sending push info');
              return $log.error('Error sending push info');
            }
            cbForSendRequest(pushInfo.registrationId);
          });
        });
      });
    }

    /**
     * @param data data members: message, title, count, sound, image, additionalData
     */
    function onNotification(data) {
       $log.debug(`Push Notification Received: ${data.message}`);

      // If notifications type is "msg" and app is started via push notifications open chat tab.
      // "type" property is coming from hub. It is added manually into the message data
      if (data.additionalData.coldstart && data.additionalData.type === 'msg') {
        $state.go('wallet.correspondentDevices');
        $timeout(() => { $rootScope.$apply(); });
      }
    }

    function onRegistration(cb) {
      return (data) => {
        // data members: registrationId
        $log.info(`Push Notification RegId: ${data.registrationId}`);
        storageService.getPushInfo((err, pushInfo) => {
          if (!pushInfo) {
            storageService.setPushInfo(projectNumber, data.registrationId, true, () => {
              if (lodash.isEmpty(wsLocal) && cb) {
                cb(null, 'ws can not be retrieved yet');
                return;
              }
              sendRequestEnableNotification(wsLocal, data.registrationId, cb);
            });
          }
        });
      };
    }

    return root;
  });
}());
