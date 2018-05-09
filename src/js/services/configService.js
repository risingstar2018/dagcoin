(function () {
  'use strict';

  angular.module('copayApp.services').factory('configService', (storageService, lodash, $log, Device, ENV) => {
    const root = {};

    const colorOpts = [
      '#DD4B39',
      '#F38F12',
      '#FAA77F',
      '#FADA58',
      '#9EDD72',
      '#77DADA',
      '#4A90E2',
      '#484ED3',
      '#9B59B6',
      '#E856EF',
      '#FF599E',
      '#7A8C9E',
    ];
    const colorOptsLength = colorOpts.length;

    const defaultConfig = {
      // wallet limits
      limits: {
        totalCosigners: 6,
      },

      hub: ENV.hub,

      getDeviceName() {
        return Device.cordova ? cordova.plugins.deviceName.name : require('os').hostname();
      },

      // wallet default config
      wallet: {
        requiredCosigners: 2,
        totalCosigners: 3,
        reconnectDelay: 5000,
        idleDurationMin: 4,
        settings: {
          unitName: 'DAG',
          unitValue: 1000000,
          unitDecimals: 6,
          unitCode: 'one',
          alternativeName: 'US Dollar',
          alternativeIsoCode: 'USD',
        },
      },

      rates: {
        url: 'https://insight.bitpay.com:443/api/rates',
      },

      pushNotifications: {
        enabled: true,
        enabledNew: true, // this is used because existing androids' enabled property is set false initially
        config: {
          android: {
            icon: 'push',
            iconColor: '#2F4053',
          },
          ios: {
            alert: 'true',
            badge: 'true',
            sound: 'true',
          },
          windows: {},
        },
      },
      autoUpdateWitnessesList: true,
      logLevel: 'debug',
      enableShowReceiveOnPassword: false
    };

    let configCache = null;

    root.getSync = function () {
      if (!configCache) {
        throw new Error('configService#getSync called when cache is not initialized');
      }
      return configCache;
    };

    root.get = function (cb) {
      storageService.getConfig((err, localConfig) => {
        if (localConfig) {
          configCache = JSON.parse(localConfig);

          // these ifs are to avoid migration problems
          if (!configCache.wallet) {
            configCache.wallet = defaultConfig.wallet;
          }
          if (!configCache.wallet.settings.unitCode) {
            configCache.wallet.settings.unitCode = defaultConfig.wallet.settings.unitCode;
          }
          if (!configCache.wallet.settings.unitValue) {
            configCache.wallet.settings.unitValue = defaultConfig.wallet.settings.unitValue;
          }
          if (!configCache.pushNotifications) {
            configCache.pushNotifications = defaultConfig.pushNotifications;
          }
          if (!configCache.hub) {
            configCache.hub = defaultConfig.hub;
          }
          if (!configCache.deviceName) {
            configCache.deviceName = defaultConfig.getDeviceName();
          }
        } else {
          configCache = lodash.clone(defaultConfig);
          configCache.deviceName = defaultConfig.getDeviceName();
        }

        $log.debug('Preferences read:', configCache);
        return cb(err, configCache);
      });
    };

    root.set = function (newOpts, cb) {
      let config = defaultConfig;
      storageService.getConfig((err, oldOpts) => {
        let oldOptions;
        let newOptions = newOpts;
        if (lodash.isString(oldOpts)) {
          oldOptions = JSON.parse(oldOpts);
        }
        if (lodash.isString(config)) {
          config = JSON.parse(config);
        }
        if (lodash.isString(newOptions)) {
          newOptions = JSON.parse(newOptions);
        }
        lodash.merge(config, oldOptions, newOptions);
        configCache = config;

        storageService.storeConfig(JSON.stringify(config), cb);
      });
    };

    root.setWithoutMergingOld = function (newOpts, cb) {
      let config = defaultConfig;
      let newOptions = newOpts;

      if (lodash.isString(config)) {
        config = JSON.parse(config);
      }
      if (lodash.isString(newOptions)) {
        newOptions = JSON.parse(newOptions);
      }
      lodash.merge(config, newOptions);
      configCache = config;

      storageService.storeConfig(JSON.stringify(config), cb);
    };

    root.reset = function (cb) {
      configCache = lodash.clone(defaultConfig);
      storageService.removeConfig(cb);
    };

    root.getDefaults = function () {
      return lodash.clone(defaultConfig);
    };

    root.getWalletColor = function (firstCharacterOfWallet) {
      return colorOpts[firstCharacterOfWallet % colorOptsLength];
    };

    return root;
  });
}());
