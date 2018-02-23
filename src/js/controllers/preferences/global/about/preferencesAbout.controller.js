(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('PreferencesAboutCtrl', PreferencesAboutCtrl);

  PreferencesAboutCtrl.$inject = [];

  function PreferencesAboutCtrl() {
    const vm = this;
    vm.version = window.version;
    vm.commitHash = window.commitHash;
  }
})();
