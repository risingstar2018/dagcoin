(function () {
  'use strict';

  angular.module('copayApp.services')
  .factory('notification', ['$timeout', 'storageService', 'profileService', 'lodash',
    function ($timeout, storageService, profileService, lodash) {
      let notifications = [];

      const queue = [];
      const settings = {
        info: {
          duration: 6000,
          enabled: true,
        },
        funds: {
          duration: 7000,
          enabled: true,
        },
        version: {
          duration: 60000,
          enabled: true,
        },
        warning: {
          duration: 7000,
          enabled: true,
        },
        error: {
          duration: 7000,
          enabled: true,
        },
        success: {
          duration: 5000,
          enabled: true,
        },
        progress: {
          duration: 0,
          enabled: true,
        },
        custom: {
          duration: 35000,
          enabled: true,
        },
        details: true,
        localStorage: true,
        html5Mode: false,
        html5DefaultIcon: 'img/icons/dagcoin.ico',
      };

      function notificationsKey() {
        const fc = profileService.focusedClient;
        const network = fc.credentials.network;
        return `notifications-${network}`;
      }

      function html5Notify(icon, title, content, ondisplay, onclose) {
        if (window.webkitNotifications && window.webkitNotifications.checkPermission() === 0) {
          let notifyIcon = icon;
          if (!notifyIcon) {
            notifyIcon = 'img/icons/dagcoin.ico';
          }
          const noti = window.webkitNotifications.createNotification(notifyIcon, title, content);
          if (typeof ondisplay === 'function') {
            noti.ondisplay = ondisplay;
          }
          if (typeof onclose === 'function') {
            noti.onclose = onclose;
          }
          noti.show();
        } else {
          settings.html5Mode = false;
        }
      }


      return {

        /* ========== SETTINGS RELATED METHODS ============= */

        disableHtml5Mode() {
          settings.html5Mode = false;
        },

        disableType(notificationType) {
          settings[notificationType].enabled = false;
        },

        enableHtml5Mode() {
          // settings.html5Mode = true;
          settings.html5Mode = this.requestHtml5ModePermissions();
        },

        enableType(notificationType) {
          settings[notificationType].enabled = true;
        },

        getSettings() {
          return settings;
        },

        toggleType(notificationType) {
          settings[notificationType].enabled = !settings[notificationType].enabled;
        },

        toggleHtml5Mode() {
          settings.html5Mode = !settings.html5Mode;
        },

        requestHtml5ModePermissions() {
          if (window.webkitNotifications) {
            if (window.webkitNotifications.checkPermission() === 0) {
              return true;
            }
            window.webkitNotifications.requestPermission(() => {
              if (window.webkitNotifications.checkPermission() === 0) {
                settings.html5Mode = true;
              } else {
                settings.html5Mode = false;
              }
            });
            return false;
          }
          return false;
        },


        /* ============ QUERYING RELATED METHODS ============ */

        getAll() {
          // Returns all notifications that are currently stored
          return notifications;
        },

        getQueue() {
          return queue;
        },

        /* ============== NOTIFICATION METHODS ============== */

        info(title, content, userData) {
          return this.awesomeNotify('info', 'fi-info', title, content, userData);
        },

        funds(title, content, userData) {
          return this.awesomeNotify('funds', 'icon-receive', title, content, userData);
        },

        version(title, content, severe) {
          return this.awesomeNotify('version', severe ? 'fi-alert' : 'fi-flag', title, content);
        },

        error(title, content, userData) {
          return this.awesomeNotify('error', 'fi-x', title, content, userData);
        },

        success(title, content, userData) {
          return this.awesomeNotify('success', 'fi-check', title, content, userData);
        },

        warning(title, content, userData) {
          return this.awesomeNotify('warning', 'fi-alert', title, content, userData);
        },

        new(title, content, userData) {
          return this.awesomeNotify('warning', 'fi-plus', title, content, userData);
        },

        sent(title, content, userData) {
          return this.awesomeNotify('warning', 'icon-paperplane', title, content, userData);
        },

        awesomeNotify(type, icon, title, content, userData) {
          this.restore(() => {
            return this.makeNotification(type, false, icon, title, content, userData);
          });
        },

        notify(image, title, content, userData) {
          this.restore(() => {
            return this.makeNotification('custom', image, true, title, content, userData);
          });
        },

        makeNotification(type, image, icon, title, content, userData) {
          const notification = {
            type,
            image,
            icon,
            title,
            content,
            timestamp: +new Date(),
            userData,
            isRead: false
          };

          notifications.push(notification);

          if (settings.html5Mode) {
            html5Notify(image, title, content, () => {
              // inner on display function
            }, () => {
              // inner on close function
            });
          }

          // this is done because html5Notify() changes the variable settings.html5Mode
          if (!settings.html5Mode) {
            queue.push(notification);
            $timeout(() => {
              queue.splice(queue.indexOf(notification), 1);
            }, settings[type].duration);
          }

          // Mobile notification
          if (window && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate([200, 100, 200]);
          }

          if (document.hidden && (type === 'info' || type === 'funds')) {
            window.Notification(title, {
              body: content,
              icon: 'img/notification.png',
            });
          }

          this.save(() => {});
          return notification;
        },

        markAllAsRead() {
          this.restore(() => {
            lodash.each(notifications, (notification) => {
              notification.isRead = true;
            });

            this.save(() => {});
          });
        },

        /* ============ PERSISTENCE METHODS ============ */

        save(callBack) {
          if (settings.localStorage) {
            const eventBus = require('core/event_bus.js');

            storageService.set(notificationsKey(), JSON.stringify(notifications), callBack);
            eventBus.emit('notifications_updated');
          }
        },

        restore(callBack) {
          storageService.get(notificationsKey(), (error, notificationsList) => {
            if (notificationsList) {
              const json = JSON.parse(notificationsList);
              notifications = json;
            } else {
              notifications = [];
            }

            callBack(notifications);
          });
        },

        clear(callBack) {
          notifications = [];
          this.save(() => {
            return callBack();
          });
        },

        unreadNotifications(callBack) {
          this.restore(() => {
            const unreadNotifications = lodash.filter(notifications, { isRead: false });
            return callBack(unreadNotifications);
          });
        },
      };
    },
  ]);
}());
