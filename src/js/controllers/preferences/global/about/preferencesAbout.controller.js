(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('PreferencesAboutCtrl', PreferencesAboutCtrl);

  PreferencesAboutCtrl.$inject = ['ngDialog'];

  function PreferencesAboutCtrl(ngDialog) {
    const vm = this;
    vm.version = window.version;
    vm.commitHash = window.commitHash;

    vm.showTermsOfUse = () => {
      ngDialog.open({
        template: `<div class="navbar-container invert">
                    <div class="navbar-container-triggers">
                      <span ng-click="closeThisDialog()">
                        <svg-icon name="arrow_back" class="back-button"></svg-icon>
                      </span>
                    </div>
                    <div class="navbar-container-title" translate>Terms of Use</div>
                   </div>
                   <dag-terms></dag-terms>
                   <dag-background></dag-background>`,
        plain: true,
        className: 'terms_of_use_confirm'
      });
    };
  }
})();
