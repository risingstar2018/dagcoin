(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('IntroConfirmCtrl', IntroConfirmCtrl);

  IntroConfirmCtrl.$inject = ['$scope', 'ngDialog', 'Device', 'gettextCatalog', '$timeout', 'storageService', 'go'];

  function IntroConfirmCtrl($scope, ngDialog, Device, gettextCatalog, $timeout, storageService, go) {
    const vm = this;
    const isCordova = Device.cordova;
    vm.agree = () => {
      if (isCordova) {
        window.plugins.spinnerDialog.show(null, gettextCatalog.getString('Loading...'), true);
      }
      vm.loading = true;
      $timeout(() => {
        storageService.setDisclaimerFlag(() => {
          $timeout(() => {
            if (isCordova) {
              window.plugins.spinnerDialog.hide();
            }
            go.walletHome();
          }, 100);
        });
      }, 100);
    };

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
        className: 'terms_of_use_confirm',
        scope: $scope,
        preCloseCallback: () => {
          vm.finish = true;
        }
      });
    };
  }
})();
