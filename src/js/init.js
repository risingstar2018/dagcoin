(function () {
  'use strict';

  angular.element(document).ready(() => {
    // Run copayApp after device is ready.
    const startAngular = function () {
      angular.bootstrap(document, ['dagcoin']);
    };

    /* Cordova specific Init */
    if (window.cordova !== undefined) {
      document.addEventListener('deviceready', () => {
        document.addEventListener('menubutton', () => {
          window.location = '#/preferences';
        }, false);
        setTimeout(() => {
          navigator.splashscreen.hide();
        }, 2000);
        startAngular();
      }, false);
    } else {
      startAngular();
    }
  });
}());
