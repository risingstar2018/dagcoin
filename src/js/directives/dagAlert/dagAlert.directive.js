(() => {
  'use strict';

  /**
   * @name DagCoin Password modal
   * @example <dag-password></dag-nav-bar>
   */
  angular
  .module('copayApp.directives')
  .directive('dagAlert', dagAlert);

  dagAlert.$inject = ['$rootScope', '$timeout', '$log', 'Device'];

  function dagAlert($rootScope, $timeout, $log, Device) {
    return {
      restrict: 'E',
      transclude: true,
      replace: true,
      scope: false,
      templateUrl: 'directives/dagAlert/dagAlert.template.html',
      controllerAs: 'alert',
      controller() {
        const self = this;

        self.showErrorPopup = function (msg, cb) {
          $log.warn(`Showing err popup:${msg}`);
          self.showPopup(msg, 'fi-alert', cb);
        };

        self.showPopup = function (msg, msgIcon, cb) {
          if (window && !!window.chrome && !!window.chrome.webstore
            && typeof msg.includes === 'function' && msg.includes('access is denied for this document')) {
            return false;
          }
          $log.warn(`Showing ${msgIcon} popup:${msg}`);
          self.show = {
            msg: msg.toString(),
            msg_icon: msgIcon,
            close(err) {
              self.show = null;
              if (cb) {
                return cb(err);
              }
            }
          };
          $timeout(() => {
            $rootScope.$apply();
          });
        };

        $rootScope.$on('Local/ShowAlert', (event, msg, msgIcon, cb) => {
          self.showPopup(msg, msgIcon, cb);
        });

        $rootScope.$on('Local/ShowErrorAlert', (event, msg, cb) => {
          self.showErrorPopup(msg, cb);
        });

        $rootScope.$on('Local/DeviceError', (event, err) => {
          self.showErrorPopup(err, () => {
            if (Device.cordova && navigator && navigator.app) {
              navigator.app.exitApp();
            }
          });
        });
      }
    };
  }
})();
