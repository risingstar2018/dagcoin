(() => {
  'use strict';

  /**
   * @name DagCoin Password modal
   * @example <dag-password></dag-nav-bar>
   */
  angular
  .module('copayApp.directives')
  .directive('dagLeftSideBar', dagLeftSideBar);

  dagLeftSideBar.$inject = ['$rootScope', 'lodash', 'profileService', 'configService', 'backButton', '$state', 'utilityService', 'Device'];

  function dagLeftSideBar($rootScope, lodash, profileService, configService, backButton, $state, utilityService, Device) {
    return {
      restrict: 'E',
      transclude: true,
      replace: true,
      scope: false,
      templateUrl: 'directives/dagLeftSideBar/dagLeftSideBar.template.html',
      controllerAs: 'sidebar',
      controller() {
        const self = this;
        self.isWindowsPhoneApp = Device.windows && Device.cordova;
        self.walletSelection = false;

        $rootScope.$on('Local/WalletListUpdated', () => {
          self.walletSelection = false;
          self.setWallets();
        });

        $rootScope.$on('Local/ColorUpdated', () => {
          self.setWallets();
        });

        $rootScope.$on('Local/AliasUpdated', () => {
          self.setWallets();
        });

        self.signout = () => {
          profileService.signout();
        };

        self.switchWallet = (selectedWalletId, currentWalletId, state) => {

          debugger;
          if (profileService.focusedClient && !profileService.focusedClient.isComplete()) {
            $state.go('copayers');
            return;
          }
          backButton.menuOpened = false;
          if (selectedWalletId === currentWalletId) {
            $state.go(state);
            return;
          }
          self.walletSelection = false;
          return profileService.setAndStoreFocus(selectedWalletId, () => {
            $state.go(state);
          });
        };

        self.switchWalletOpenPreferences = (selectedWalletId, currentWalletId) => {
          self.switchWallet(selectedWalletId, currentWalletId, 'preferences');
        };

        self.toggleWalletSelection = () => {
          self.walletSelection = !self.walletSelection;
          if (!self.walletSelection) {
            return;
          }
          self.setWallets();
        };

        self.setWallets = () => {
          if (!profileService.profile) {
            return;
          }
          const config = configService.getSync();
          config.colorFor = config.colorFor || {};
          config.aliasFor = config.aliasFor || {};
          const ret = lodash.map(profileService.profile.credentials, c => ({
            m: c.m,
            n: c.n,
            name: config.aliasFor[c.walletId] || c.walletName,
            id: c.walletId,
            color: '#d51f26',
          }));
          self.wallets = utilityService.sortWalletsByName(ret);
        };

        self.setWallets();
      }
    };
  }
})();
