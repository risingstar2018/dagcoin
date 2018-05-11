import { Platform } from 'react-native-web';

import WebFileStorageAdapter from './webFileStorageAdapter';
import MobileFileStorageAdapter from './mobileFileStorageAdapter';

class FileStorage {
    constructor() {
        this.adapter = Platform.OS === 'web' ? new WebFileStorageAdapter : new MobileFileStorageAdapter;
    }

    async get(path) {
        return await this.adapter.get(path, value);
    }

    async set(path, value) {
        return await this.create(path, value);
    }

    async remove(path) {
        return await this.adapter.remove(path);

    };

    async create(path, value) {
        return await this.adapter.create(path, value);
    }
}

export default FileStorage;
