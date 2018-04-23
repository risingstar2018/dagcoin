(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('SplashCtrl', SplashCtrl);

  SplashCtrl.$inject = ['$scope', '$timeout', '$log', 'configService', 'profileService', 'storageService', 'fileSystemService',
    'go', 'Device'];

  function SplashCtrl($scope, $timeout, $log, configService, profileService, storageService, fileSystemService, go, Device) {
    const vm = this;
    vm.step = Device.cordova ? 'device_name' : 'registration_type';
    vm.registration_type = 'default';
    vm.wallet_type = 'light';

    vm.saveDeviceName = () => {
      $log.debug(`saveDeviceName: ${vm.deviceName}`);
      const device = require('core/device.js');
      device.setDeviceName(vm.deviceName);
      const opts = { deviceName: vm.deviceName };
      configService.set(opts, (err) => {
        if (err) {
          vm.$emit('Local/DeviceError', err);
        }
        $timeout(() => {
          vm.bDeviceNameSet = true;
        });
      });
    };

    configService.get((err, config) => {
      if (err) {
        $log.error('failed to read config');
        throw Error('failed to read config');
      }
      vm.deviceName = config.deviceName;
    });

    vm.setRegistrationType = () => {
      if (this.registration_type === 'default') {
        vm.setWalletType();
      } else if (this.registration_type === 'backup') {
        vm.setWalletType(() => {
          go.path('initialRecovery');
        });
      } else {
        vm.step = 'wallet_type';
      }
    };

    vm.setWalletType = (cb) => {
      const bLight = (vm.wallet_type === 'light');
      if (!bLight) {
        vm.step = 'device_name';
        return;
      }

      const userConfFile = fileSystemService.getUserConfFilePath();
      fileSystemService.writeFile(userConfFile, JSON.stringify({
        bLight
      }, null, '\t'), 'utf8', (err) => {
        if (err) {
          $log.error(`failed to write conf.json: ${err}`);
          throw Error(`failed to write conf.json: ${err}`);
        }
        if (cb) {
          cb();
        } else {
          vm.step = 'device_name';
          $scope.$apply();
        }
      });
    };

    vm.create = (noWallet) => {
      if (vm.creatingProfile) {
        return console.log('already creating profile');
      }
      vm.creatingProfile = true;

      return $timeout(() => {
        profileService.create({ noWallet }, (err) => {
          if (err) {
            vm.creatingProfile = false;
            $log.warn(err);
            vm.error = err;
            $scope.$apply();
          }
        });
      }, 100);
    };

    vm.init = () => {
      storageService.getDisclaimerFlag((err, val) => {
        if (!val) {
          go.path('intro_confirm');
        }
        if (profileService.profile) {
          go.walletHome();
        }
      });
    };

    vm.init();
  }
})();
