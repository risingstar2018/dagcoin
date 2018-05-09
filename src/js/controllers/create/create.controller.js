(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('CreateCtrl', CreateCtrl);

  CreateCtrl.$inject = ['$scope', '$rootScope', '$location', '$anchorScroll', '$timeout', '$log', 'lodash', 'go', 'profileService',
    'configService', 'gettextCatalog', 'derivationPathHelper', 'correspondentListService', 'utilityService'];

  function CreateCtrl($scope, $rootScope, $location, $anchorScroll, $timeout, $log, lodash, go, profileService,
                      configService, gettextCatalog, derivationPathHelper, correspondentListService, utilityService) {
    const vm = this;
    const defaults = configService.getDefaults();
    const NETWORK = 'livenet';
    vm.account = 1;
    vm.derivationPath = derivationPathHelper.default;
    vm.TCValues = lodash.range(2, defaults.limits.totalCosigners + 1);
    vm.totalCosignersNumber = defaults.wallet.totalCosigners;
    vm.cosigners = []; // Array(vm.totalCosignersNumber);
    vm.requiredCosignersNumber = 0;

    for (let i = 0; i < vm.totalCosignersNumber - 1; i += 1) {
      vm.cosigners.push({});
    }
    correspondentListService.list((err, ab) => {
      vm.candidate_cosigners = ab;
      $scope.$digest();
    });

    // ng-repeat defined number of times instead of repeating over array?
    vm.getNumber = num => new Array(num);
    vm.setTotalCosigners = setTotalCosigners;
    vm.setMultisig = setMultisig;
    vm.onCorrespondentSelected = onCorrespondentSelected;
    vm.setSeedSource = setSeedSource;
    vm.createWallet = createWallet;
    vm.create = create;
    vm.formFocus = formFocus;
    vm.loadExistingWallets = loadExistingWallets;

    function loadExistingWallets() {
      if (!profileService.profile) {
        return;
      }
      const config = configService.getSync();
      config.aliasFor = config.aliasFor || {};
      const ret = lodash.map(profileService.profile.credentials, c => ({
        name: config.aliasFor[c.walletId] || c.walletName,
      }));
      vm.wallets = utilityService.sortWalletsByName(ret);
    }

    function formFocus(what) {
      if (what && what === 'my-name') {
        vm.hideWalletName = true;
        vm.hideTabs = true;
      } else if (what && what === 'wallet-name') {
        vm.hideTabs = true;
      } else {
        vm.hideWalletName = false;
        vm.hideTabs = false;
      }
      $timeout(() => {
        $rootScope.$digest();
      }, 1);
    }

    function create(form) {
      if (form && form.$invalid) {
        vm.error = gettextCatalog.getString('Please enter the required fields');
        return;
      }
      if (vm.cosigners.length !== vm.totalCosignersNumber - 1) {
        setError('invalid number of cosigners');
        return;
      }
      const existingWallet = lodash.find(vm.wallets, { name: form.walletName.$modelValue });
      if (existingWallet) {
        setError('Wallet with the same name already exists');
        return;
      }

      const opts = {
        m: vm.requiredCosignersNumber,
        n: vm.totalCosignersNumber,
        name: form.walletName.$modelValue,
        networkName: NETWORK,
        cosigners: [],
        isSingleAddress: form.isSingleAddress.$viewValue
      };
      if (vm.totalCosignersNumber > 1) {
        opts.cosigners = lodash.uniq(vm.cosigners.map(cosigner => cosigner.device_address));
        if (opts.cosigners.length !== vm.totalCosignersNumber - 1) {
          setError('Please select different co-signers');
          return;
        }
        for (let i = 0; i < opts.cosigners.length; i += 1) {
          if (!opts.cosigners[i] || opts.cosigners[i].length !== 33) {
            setError('Please fill all co-signers');
            return;
          }
        }
      }
      createWallet(opts);
    }

    function createWallet(opts) {
      vm.loading = true;
      $timeout(() => {
        profileService.createWallet(opts, (err, walletId) => {
          vm.loading = false;
          if (err) {
            $log.warn(err);
            vm.error = err;
            $timeout(() => {
              $rootScope.$apply();
            });
            return;
          }
          if (opts.externalSource) {
            if (opts.n === 1) {
              $rootScope.$emit('Local/WalletImported', walletId);
            }
          }
          if (opts.isSingleAddress) {
            profileService.setSingleAddressFlag(true);
          }
        });
      }, 100);
    }

    function setSeedSource() {
      vm.seedSourceId = vm.seedSource.id;

      $timeout(() => {
        $rootScope.$apply();
      });
    }

    function onCorrespondentSelected(deviceAddress) {
      if (deviceAddress === 'new') {
        $rootScope.goBackState = 'create';
        vm.multisigSelected = false;
        go.path('addCorrespondentDevice');
      }
    }

    function setMultisig() {
      vm.setTotalCosigners(3);
      vm.requiredCosignersNumber = 2;
    }

    function setTotalCosigners(tc) {
      const oldLen = vm.cosigners.length;
      const newLen = tc - 1;
      if (newLen > oldLen) {
        for (let i = oldLen; i < newLen; i += 1) {
          vm.cosigners.push({});
        }
      } else if (newLen < oldLen) {
        vm.cosigners.length = newLen;
      }

      updateRCSelect(tc);
      updateSeedSourceSelect(tc);
      vm.seedSourceId = vm.seedSource.id;
    }

    function updateRCSelect(n) {
      vm.totalCosignersNumber = n;
      vm.RCValues = lodash.range(1, n + 1);
      if (vm.requiredCosignersNumber > n || !vm.requiredCosignersNumber) {
        vm.requiredCosignersNumber = parseInt((n / 2) + 1, 10);
      }
    }

    function updateSeedSourceSelect() {
      vm.seedOptions = [{
        id: 'new',
        label: gettextCatalog.getString('New Random Seed'),
      }, {
        id: 'set',
        label: gettextCatalog.getString('Specify Seed...'),
      }];
      vm.seedSource = vm.seedOptions[0];
    }

    function setError(error) {
      $log.error(error);
      vm.error = gettextCatalog.getString(error);

      $location.hash('error-area');
      $anchorScroll();
    }

    $scope.$on('$destroy', () => {
      $rootScope.hideWalletNavigation = false;
    });

    if ($rootScope.goBackState) {
      $rootScope.goBackState = false;
      setMultisig();
      vm.multisigSelected = true;
    }
    // setTotalCosigners(1);
    updateSeedSourceSelect(1);
    setSeedSource('new');
    loadExistingWallets();
  }
})();
