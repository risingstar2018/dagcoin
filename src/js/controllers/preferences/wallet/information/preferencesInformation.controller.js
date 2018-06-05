(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('PreferencesInformationCtrl', PreferencesInformationCtrl);

  PreferencesInformationCtrl.$inject = ['$scope', '$rootScope', '$log', 'configService', 'profileService', '$timeout',
    'gettextCatalog', 'addressService', 'ENV', 'Device'];

  function PreferencesInformationCtrl($scope, $rootScope, $log, configService, profileService, $timeout, gettextCatalog,
                                      addressService, ENV, Device) {
    const vm = this;
    const fc = profileService.focusedClient;
    const c = fc.credentials;
    const indexScope = $scope.index;
    const basePath = c.getBaseAddressDerivationPath();
    const config = configService.getSync().wallet.settings;
    vm.walletName = c.walletName;
    vm.walletId = c.walletId;
    vm.network = c.network;
    vm.derivationStrategy = c.derivationStrategy || 'BIP44';
    vm.basePath = basePath;
    vm.M = c.m;
    vm.N = c.n;
    vm.addrs = null;
    vm.isCordova = Device.cordova;

    vm.hasListOfBalances = () => !!Object.keys(vm.assocListOfBalances || {}).length;
    vm.isSingleAddressWallet = () => fc.isSingleAddress;
    vm.setAddress = setAddress;
    vm.sendAddrs = sendAddrs;


    function sendAddrs() {
      const self = this;
      self.loading = true;
      $timeout(() => {
        fc.getAddresses({
          doNotVerify: true,
        }, (err, addrs) => {
          self.loading = false;
          if (err) {
            $log.warn(err);
            return;
          }

          let body = `Dagcoin Wallet "${vm.walletName}" Addresses.\n\n`;
          body += '\n';
          body += addrs.map(v => (`* ${v.address} ${v.path} ${formatDate(v.createdOn)}`)).join('\n');
          if (vm.isCordova) {
            window.plugins.socialsharing.shareViaEmail(
              body,
              'Dagcoin Addresses',
              null, // TO: must be null or an array
              null, // CC: must be null or an array
              null, // BCC: must be null or an array
              null, // FILES: can be null, a string, or an array
              () => {
              },
              () => {
              }
            );
          }
          $timeout(() => {
            $scope.$apply();
          }, 1000);
        });
      }, 100);

      function formatDate(ts) {
        const dateObj = new Date(ts * 1000);
        if (!dateObj) {
          $log.debug('Error formating a date');
          return 'DateError';
        }
        if (!dateObj.toJSON()) {
          return '';
        }
        return dateObj.toJSON();
      }
    }

    function setAddress() {
      if (!fc) {
        return;
      }
      if (indexScope.shared_address) {
        $log.error('attempt to generate for shared address');
        throw Error('attempt to generate for shared address');
      }
      addressService.getAddress(fc.credentials.walletId, true, (err, addr) => {
        if (err) {
          $rootScope.$emit('Local/ShowAlert', err, 'fi-alert', () => {
          });
        } else if (addr) {
          $rootScope.$emit('Local/ShowAlert', gettextCatalog.getString('New Address successfully generated.'), 'fi-check', () => {
          });
          init();
        }
      });
    }

    function init() {
      fc.getAddresses({
        doNotVerify: true,
      }, (err, addrs) => {
        if (err) {
          $log.warn(err);
          return;
        }
        vm.addrs = addrs;
        $timeout(() => {
          $scope.$apply();
        });
      });
      fc.getListOfBalancesOnAddresses((listOfBalances) => {
        const balanceList = listOfBalances.map((row) => {
          if (row.asset === 'base' || row.asset === ENV.DAGCOIN_ASSET) {
            const assetName = row.asset !== 'base' ? 'DAG' : 'base';
            const unitName = row.asset !== 'base' ? config.dagUnitName : config.unitName;
            row.amount = `${profileService.formatAmount(row.amount, assetName, { dontRound: true })} ${unitName}`;
            return row;
          }
          return row;
        });
        // groupBy address
        const assocListOfBalances = {};
        balanceList.forEach((row) => {
          if (assocListOfBalances[row.address] === undefined) assocListOfBalances[row.address] = [];
          assocListOfBalances[row.address].push(row);
        });
        vm.assocListOfBalances = assocListOfBalances;
        $timeout(() => {
          $scope.$apply();
        });
      });
    }

    init();
  }
})();
