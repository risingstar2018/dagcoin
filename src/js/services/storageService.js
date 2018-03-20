(function () {
  'use strict';

  angular.module('copayApp.services')
    .factory('storageService', (logHeader, fileStorageService, localStorageService, sjcl, $log, Device) => {
      const root = {};

      // File storage is not supported for writting according to
      // https://github.com/apache/cordova-plugin-file/#supported-platforms
      const shouldUseFileStorage = Device.cordova && !Device.windows;
      $log.debug('Using file storage:', shouldUseFileStorage);

      const storage = shouldUseFileStorage ? fileStorageService : localStorageService;

      const getUUID = function (cb) {
        // TO SIMULATE MOBILE
        // return cb('hola');
        if (!window || !window.plugins || !window.plugins.uniqueDeviceID) {
          return cb(null);
        }

        return window.plugins.uniqueDeviceID.get(uuid => cb(uuid), cb);
      };

      const encryptOnMobile = (text, cb) => cb(null, text);

      const decryptOnMobile = function (text, cb) {
        let json;
        let inputText;
        try {
          json = JSON.parse(text);
        } catch (e) {
          $log.warn(e);
        }

        if (!json) {
          return cb('Could not access storage');
        }

        if (!json.iter || !json.ct) {
          $log.debug('Profile is not encrypted');
          return cb(null, text);
        }

        $log.debug('Profile is encrypted');
        return getUUID((uuid) => {
          $log.debug(`Device UUID:${uuid}`);
          if (!uuid) {
            return cb('Could not decrypt storage: could not get device ID');
          }

          try {
            inputText = sjcl.decrypt(uuid, text);

            $log.info('Migrating to unencrypted profile');
            return storage.set('profile', inputText, err => cb(err, inputText));
          } catch (e) {
            $log.warn('Decrypt error: ', e);
            return cb('Could not decrypt storage: device ID mismatch');
          }
        });
      };

      // on mobile, the storage keys are files, we have to avoid slashes in filenames
      function getSafeWalletId(walletId) {
        return walletId.replace(/[\/+=]/g, '');
      }

      root.storeNewProfile = function (profile, cb) {
        encryptOnMobile(profile.toObj(), (err, x) => {
          storage.create('profile', x, cb);
        });
      };

      root.storeProfile = function (profile, cb) {
        encryptOnMobile(profile.toObj(), (err, x) => {
          storage.set('profile', x, cb);
        });
      };

      root.getProfile = function (cb) {
        storage.get('profile', (err, str) => {
          // console.log("prof="+str+", err="+err);
          if (err || !str) {
            return cb(err);
          }

          return decryptOnMobile(str, (decryptOnMobileError, profileStr) => {
            if (decryptOnMobileError) {
              return cb(decryptOnMobileError);
            }
            let p;
            let profileError;
            try {
              p = Profile.fromString(profileStr);
            } catch (e) {
              $log.debug('Could not read profile:', e);
              profileError = new Error(`Could not read profile:${e}`);
            }
            return cb(profileError, p);
          });
        });
      };

      root.deleteProfile = function (cb) {
        storage.remove('profile', cb);
      };

      root.storeFocusedWalletId = function (id, cb) {
        storage.set('focusedWalletId', id || '', cb);
      };

      root.getFocusedWalletId = function (cb) {
        storage.get('focusedWalletId', cb);
      };

      root.setBackupFlag = function (walletId, cb) {
        storage.set(`backup-${getSafeWalletId(walletId)}`, Date.now(), cb);
      };

      root.getBackupFlag = function (walletId, cb) {
        storage.get(`backup-${getSafeWalletId(walletId)}`, cb);
      };

      root.clearBackupFlag = function (walletId, cb) {
        storage.remove(`backup-${getSafeWalletId(walletId)}`, cb);
      };

      root.getConfig = function (cb) {
        storage.get('config', cb);
      };

      root.storeConfig = function (val, cb) {
        $log.debug('Storing Preferences', val);
        storage.set('config', val, cb);
      };

      root.clearConfig = function (cb) {
        storage.remove('config', cb);
      };

      root.setDisclaimerFlag = function (cb) {
        storage.set('agreeDisclaimer', true, cb);
      };

      root.getDisclaimerFlag = function (cb) {
        storage.get('agreeDisclaimer', cb);
      };

      root.setRemotePrefsStoredFlag = function (cb) {
        storage.set('remotePrefStored', true, cb);
      };

      root.getRemotePrefsStoredFlag = function (cb) {
        storage.get('remotePrefStored', cb);
      };

      root.setPushInfo = function (projectNumber, registrationId, enabled, cb) {
        storage.set('pushToken', JSON.stringify({ projectNumber, registrationId, enabled }), cb);
      };

      root.getPushInfo = function (cb) {
        storage.get('pushToken', (err, data) => {
          if (err) {
            return cb(err);
          }
          return cb(null, (data ? JSON.parse(data) : data));
        });
      };

      root.removePushInfo = function (cb) {
        storage.remove('pushToken', cb);
      };

      root.accessor = (key, value) => (value ? root.set(key, value) : root.get(key));

      root.set = (key, value, cb) => storage.set(key, value, () => !!root.get(key, cb));

      root.get = (key, cb) => {
        storage.get(key, (err, value) => {
          if (err) {
            return cb(err);
          }
          return cb(null, value);
        });
      };

      root.remove = key => storage.remove(key, () => !root.get(key));

      return root;
    });
}());
