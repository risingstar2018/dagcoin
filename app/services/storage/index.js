import _ from 'lodash';
import sjcl from 'sjcl';

import { getUniqueID } from 'react-native-device-info';

import FileStorage from './fileStorage';

class StorageService {
    constructor() {
        this.storage = new FileStorage();
    }

    getUUID() {
        return getUniqueID();
    };

    decryptOnMobile(text) {
        const json = JSON.parse(text);

        if (!_.isObject(json)) {
            throw new Error('Could not access storage');
        }

        if (!json.iter || !json.ct) {
            return text;
        }

        const uuid = this.getUUID();

        if (!uuid) {
            throw new Error('Could not decrypt storage: could not get device ID');
        }

        const inputText = sjcl.decrypt(uuid, text);

        this.storage.set('profile', inputText);

        return inputText;
    };

    getSafeWalletId(walletId) {
        return walletId.replace(/[\/+=]/g, '');
    }

    storeProfile(profile) {
        this.storage.create('profile', JSON.stringify(profile));
    }

    getProfile() {
        try {
            const profile = this.storage.get('profile');
            const decryptedProfile = this.decryptOnMobile(profile);

            return JSON.parse(decryptedProfile);
        } catch (e) {
            return false;
        }
    }

    deleteProfile() {
        return this.storage.remove('profile');
    }

    storeFocusedWalletId(id) {
        return this.storage.set('focusedWalletId', id || '');
    }

    getFocusedWalletId() {
        return this.storage.get('focusedWalletId');
    }

    setBackupFlag(walletId) {
        return this.storage.set(`backup-${this.getSafeWalletId(walletId)}`, Date.now());
    }

    getBackupFlag(walletId) {
        return this.storage.get(`backup-${this.getSafeWalletId(walletId)}`);
    }

    clearBackupFlag(walletId) {
        return this.storage.remove(`backup-${this.getSafeWalletId(walletId)}`);
    }

    getConfig() {
        return this.storage.get('config');
    }

    storeConfig(value) {
        return this.storage.set('config', value);
    }

    clearConfig() {
        return this.storage.remove('config');
    }

    setDisclaimerFlag() {
        return this.storage.set('agreeDisclaimer', true);
    }

    getDisclaimerFlag() {
        return this.storage.get('agreeDisclaimer');
    }

    setRemotePrefsStoredFlag() {
        return this.storage.set('remotePrefStored', true);
    }

    getRemotePrefsStoredFlag() {
        return this.storage.get('remotePrefStored');
    }

    setPushInfo(projectNumber, registrationId, enabled) {
        return this.storage.set('pushToken', JSON.stringify({ projectNumber, registrationId, enabled }));
    };

    getPushInfo() {
        return this.storage.get('pushToken');
    };

    removePushInfo() {
        return this.storage.remove('pushToken');
    };

    accessor(key, value) {
        return (value ? this.set(key, value) : this.get(key))
    }

    set(key, value) {
        return this.storage.set(key, value, () => !!this.get(key));
    }

    get(key) {
        return this.storage.get(key);
    }

    remove(key) {
        return this.storage.remove(key, () => !this.get(key));
    }
}

export default this.StorageService;
