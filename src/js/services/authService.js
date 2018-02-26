(() => {
  'use strict';

  angular
    .module('copayApp.services')
    .factory('authService', authService);

  authService.$inject = [];

  function authService() {
    const root = {};
    root.objRequest = null;
    return root;
  }
})();
