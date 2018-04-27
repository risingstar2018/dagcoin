import BitcoreWallet from '../../lib/angular-bitcore-wallet-client';

import { getUniqueID } from 'react-native-device-info';
import FileStorage from './storageAdapter';

const SJCL = BitcoreWallet.getSJCL();

class StorageService {
    constructor(storage = null) {
        this.storage = storage || new FileStorage();
    }

    encryptOnMobile(text, cb) {
        cb(null, text);
    }

    decryptOnMobile(text, cb) {
        let json;
        let inputText;

        try {
            json = JSON.parse(text);
        } catch (e) {
            //Log error - TODO
        }

        if (!json) {
            return cb('Could not access storage');
        }

        if (!json.iter || !json.ct) {
            return cb(null, text);
        }

        const deviceUuid = getUniqueID();

        if (!deviceUuid) {
            return cb('Could not decrypt storage: could not get device ID');
        }

        try {
            inputText = SJCL.decrypt(deviceUuid, text);

            return this.storage.set('profile', inputText, err => cb(err, inputText));
        } catch (e) {
            return cb('Could not decrypt storage: device ID mismatch');
        }
    };

    // on mobile, the storage keys are files, we have to avoid slashes in filenames
    getSafeWalletId(walletId) {
        return walletId.replace(/[\/+=]/g, '');
    }

    storeNewProfile(profile, cb) {
        this.encryptOnMobile(profile.toObj(), (err, x) => {
            this.storage.create('profile', x, cb);
        });
    };

    storeProfile(profile, cb) {
        this.encryptOnMobile(profile.toObj(), (err, x) => {
            this.storage.set('profile', x, cb);
        });
    };

    getProfile(cb) {
        this.storage.get('profile', (err, str) => {
            if (err || !str) {
                return cb(err);
            }

            return this.decryptOnMobile(str, (decryptOnMobileError, profileStr) => {
                if (decryptOnMobileError) {
                    return cb(decryptOnMobileError);
                }
                let p;
                let profileError;
                try {
                    p = Profile.fromString(profileStr);
                } catch (e) {
                    profileError = new Error(`Could not read profile:${e}`);
                }
                return cb(profileError, p);
            });
        });
    };

    deleteProfile(cb) {
        this.storage.remove('profile', cb);
    };

    storeFocusedWalletId(id, cb) {
        this.storage.set('focusedWalletId', id || '', cb);
    };

    getFocusedWalletId(cb) {
        this.storage.get('focusedWalletId', cb);
    };

    setBackupFlag(walletId, cb) {
        this.storage.set(`backup-${this.getSafeWalletId(walletId)}`, Date.now(), cb);
    };

    getBackupFlag(walletId, cb) {
        this.storage.get(`backup-${this.getSafeWalletId(walletId)}`, cb);
    };

    clearBackupFlag(walletId, cb) {
        this.storage.remove(`backup-${this.getSafeWalletId(walletId)}`, cb);
    };

    getConfig(cb) {
        this.storage.get('config', cb);
    };

    storeConfig(val, cb) {
        this.storage.set('config', val, cb);
    };

    clearConfig(cb) {
        this.storage.remove('config', cb);
    };

    setDisclaimerFlag(cb) {
        this.storage.set('agreeDisclaimer', true, cb);
    };

    getDisclaimerFlag(cb) {
        this.storage.get('agreeDisclaimer', cb);
    };

    setRemotePrefsStoredFlag(cb) {
        this.storage.set('remotePrefStored', true, cb);
    };

    getRemotePrefsStoredFlag(cb) {
        this.storage.get('remotePrefStored', cb);
    };

    setPushInfo(projectNumber, registrationId, enabled, cb) {
        this.storage.set('pushToken', JSON.stringify({ projectNumber, registrationId, enabled }), cb);
    };

    getPushInfo(cb) {
        this.storage.get('pushToken', (err, data) => {
            if (err) {
                return cb(err);
            }
            return cb(null, (data ? JSON.parse(data) : data));
        });
    };

    removePushInfo(cb) {
        this.storage.remove('pushToken', cb);
    };

    accessor(key, value) {
        return value ? this.set(key, value) : this.get(key);
    }

    set(key, value, cb) {
        this.storage.set(key, value, () => !!this.get(key, cb));
    }

    get(key, cb) {
        return this.storage.get(key, (err, value) => {
            if (err) {
                return cb(err);
            }

            return cb(null, value);
        });
    };

    remove(key) {
        this.storage.remove(key, () => !this.get(key));
    }
}

export const storage = new StorageService();
