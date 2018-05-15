/* eslint-disable radix,no-nested-ternary,no-shadow,no-plusplus,consistent-return,no-underscore-dangle,no-use-before-define,comma-dangle */
(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('WalletCtrl', WalletCtrl);

  WalletCtrl.$inject = ['$scope', '$rootScope', '$timeout', '$log', 'lodash', 'Device', 'sharedService'];

  function WalletCtrl($scope, $rootScope, $timeout, $log, lodash, Device, sharedService) {
    const self = this;
    $rootScope.hideMenuBar = false;
    $rootScope.wpInputFocused = false;
    const isCordova = Device.cordova;

    this.addresses = [];
    this.blockUx = false;

    const disableAddrListener = $rootScope.$on('Local/NeedNewAddress', () => {
      self.setAddress(true);
    });

    const disableOngoingProcessListener = $rootScope.$on('Addon/OngoingProcess', (e, name) => {
      self.setOngoingProcess(name);
    });

    $scope.$on('$destroy', () => {
      console.log('WalletCtrl initialized');
      disableAddrListener();
      disableOngoingProcessListener();
      $rootScope.hideMenuBar = false;
    });

    this.bindTouchDown = function (tries) {
      const self = this;
      let touchDownTries = tries || 0;
      if (touchDownTries > 5) return;
      const e = document.getElementById('menu-walletHome');
      if (!e) {
        $timeout(() => {
          self.bindTouchDown(++touchDownTries);
        }, 500);
      }

      // on touchdown elements
      $log.debug('Binding touchstart elements...');
      ['hamburger', 'menu-walletHome', 'menu-send', 'menu-receive', 'menu-history'].forEach((id) => {
        const e = document.getElementById(id);
        if (e) {
          e.addEventListener('touchstart', () => {
            try {
              event.preventDefault();
            } catch (e) {
              // continue regardless of error
            }
            angular.element(e).triggerHandler('click');
          }, true);
        }
      });
    };

    this.hideMenuBar = lodash.debounce(function (hide) {
      if (hide) {
        $rootScope.hideMenuBar = true;
        this.bindTouchDown();
      } else {
        $rootScope.hideMenuBar = false;
      }
      $rootScope.$digest();
    }, 100);

    this.formFocus = function (what) {
      if (isCordova) {
        this.hideMenuBar(what);
      }

      if (!what) {
        // this.hideAddress = false;
        // this.hideAmount = false;
      } else if (what === 'amount') {
        // this.hideAddress = true;
      } else if (what === 'msg') {
        // this.hideAddress = true;
        // this.hideAmount = true;
      }
      $timeout(() => {
        $rootScope.$digest();
      }, 1);
    };

    this.setOngoingProcess = function (name) {
      const self = this;
      self.blockUx = !!name;

      if (isCordova) {
        if (name) {
          window.plugins.spinnerDialog.hide();
          window.plugins.spinnerDialog.show(null, `${name}...`, true);
        } else {
          window.plugins.spinnerDialog.hide();
        }
      } else {
        self.onGoingProcess = name;
        $timeout(() => {
          $rootScope.$apply();
        });
      }
    };

    this.shareAddress = function () {
      if (isCordova) {
        if (Device.android || Device.windows) {
          window.ignoreMobilePause = true;
        }
        const addr = sharedService.getCurrentReceiveAddress();
        window.plugins.socialsharing.share(addr, null, null, null);
      }
    };

    /* Start setup */

    this.bindTouchDown();
  }
})();
