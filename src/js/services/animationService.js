(function () {
  'use strict';

  angular
    .module('copayApp.services')
    .factory('animationService', animationService);

  animationService.$inject = ['Device'];

  function animationService(Device) {
    const isCordova = Device.cordova;
    return {
      modalAnimated: {
        slideUp: isCordova ? 'tiny animated slideInUp' : 'tiny',
        slideRight: isCordova ? 'tiny animated slideInRight' : 'tiny',
        slideOutDown: isCordova ? 'slideOutDown' : 'hideModal',
        slideOutRight: isCordova ? 'slideOutRight' : 'hideModal'
      }
    };
  }
}());
