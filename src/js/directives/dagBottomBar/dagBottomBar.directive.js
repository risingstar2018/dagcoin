(() => {
  'use strict';

  /**
   * @desc custome icon directive
   * @example <dag-bottom-bar></dag-bottom-bar>
   */
  angular
    .module('copayApp.directives')
    .directive('dagBottomBar', dagBottomBar);

  dagBottomBar.$inject = ['gettextCatalog'];

  function dagBottomBar(gettextCatalog) {
    return {
      restrict: 'E',
      templateUrl: 'directives/dagBottomBar/dagBottomBar.template.html',
      replace: true,
      link: ($scope) => {
        $scope.menu = [{
          title: gettextCatalog.getString('My Wallet'),
          icon: 'wallet',
          link: 'walletHome.home'
        }, {
          title: gettextCatalog.getString('Receive'),
          icon: 'banknote',
          link: 'walletHome.receive'
        }, {
          title: gettextCatalog.getString('Send'),
          icon: 'paperplane',
          link: 'walletHome.send'
        }, {
          title: gettextCatalog.getString('Paired Devices'),
          icon: 'share',
          new_state: 'correspondentDevices',
          link: 'correspondentDevices'
        }];
      }
    };
  }
})();
