(function () {
  'use strict';

  const eventBus = require('byteballcore/event_bus.js');

  angular.module('copayApp.services')
  .factory('newVersion', ($modal, $rootScope, configService, $q, $log) => {
    const root = {};
    root.askForVersion = askForVersion;
    root.changeShowFlag = changeShowFlag;
    configService.get((err, config) => {
      if (err) {
        throw Error('failed to read config for showNewVersionFlag');
      }
      root.show = config.wallet.showNewVersionFlag;
    });

    eventBus.on('new_version', () => {
      if (root.show) {
        const modalInstance = $modal.open({
          templateUrl: 'views/modals/newVersionIsAvailable.html',
          controller: 'newVersionIsAvailable'
        });
        $rootScope.$on('closeModal', () => {
          modalInstance.dismiss('cancel');
        });
      }
    });
    function changeShowFlag(flag) {
      configService.set({ wallet: { showNewVersionFlag: flag } }, (err) => {
        if (err) $log.debug(err);
      });
    }

    function askForVersion() {
      const device = require('byteballcore/device');
      const config = configService.getSync();

      updateHubLocation().then(() => { device.setDeviceHub(config.hub); });
    }

    function updateHubLocation() {
      const defaultConfig = configService.getDefaults();
      const config = configService.getSync();
      const deferred = $q.defer();

      config.hub = defaultConfig.hub;

      configService.setWithoutMergingOld(config, (err) => {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve();
        }
      });

      return deferred.promise;
    }

    return root;
  });
}());
