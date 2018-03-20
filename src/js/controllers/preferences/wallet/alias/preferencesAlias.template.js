(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('PreferencesAliasCtrl', PreferencesAliasCtrl);

  PreferencesAliasCtrl.$inject = ['$scope', '$timeout', 'configService', 'profileService', 'go', 'gettextCatalog', 'lodash', 'utilityService', '$log'];

  function PreferencesAliasCtrl($scope, $timeout, configService, profileService, go, gettextCatalog, lodash, utilityService, $log) {
    const vm = this;
    const config = configService.getSync();
    const fc = profileService.focusedClient;
    const walletId = fc.credentials.walletId;
    config.aliasFor = config.aliasFor || {};
    vm.alias = config.aliasFor[walletId] || fc.credentials.walletName;


    vm.save = save;
    vm.loadExistingWallets = loadExistingWallets;

    $scope.$watch('prefAlias.alias', (newValue, oldValue) => {
      if (typeof newValue !== 'undefined') {
        if (newValue.length > 50) {
          vm.alias = oldValue;
        }
      }
    });

    function setError(error) {
      $log.error(error);
      vm.error = gettextCatalog.getString(error);
    }

    function save() {
      const opts = {
        aliasFor: {},
      };
      opts.aliasFor[walletId] = vm.alias.trim();
      const existingWallet = lodash.find(vm.wallets, { name: vm.alias.trim() });

      if (existingWallet) {
        setError('Wallet with the same name already exists');
        return;
      }

      configService.set(opts, (err) => {
        if (err) {
          $scope.$emit('Local/DeviceError', err);
          return;
        }
        $scope.$emit('Local/AliasUpdated');
        $timeout(() => {
          go.path('preferences');
        }, 50);
      });
    }

    function loadExistingWallets() {
      if (!profileService.profile) {
        return;
      }
      config.aliasFor = config.aliasFor || {};
      const ret = lodash.map(profileService.profile.credentials, c => ({
        name: config.aliasFor[c.walletId] || c.walletName,
      }));
      vm.wallets = utilityService.sortWalletsByName(ret);
      vm.wallets = lodash.filter(vm.wallets, c => (c.name !== vm.alias));
    }

    loadExistingWallets();
  }
})();
