import FileStorage from './fileStorage/index';

class BaseStorage {
    path = null;
    hash = null;
    fileName = null;

    constructor(fileName) {
        this.fileName = fileName;
        this.storage = new FileStorage();
        this.path = this.storage.getAppDataDir();
    }

    accessor(key, value) {
        return (value ? this.set(key, value) : this.get(key))
    }

    getAll() {
        return new Promise((resolve, reject) => {
            if (this.hash) {
                resolve(this.hash);
                return;
            }

            this.storage.prepareDir(this.path).then(() => {
                this.storage.read(`${this.path}/${this.fileName}`).then((result) => {
                    this.hash = JSON.parse(result);
                    resolve(this.hash);
                }, () => {
                    this.hash = {};
                    resolve(this.hash);
                });
            }, reject);
        });
    }

    saveAll() {
        return new Promise(((resolve, reject) => {
            this.storage.write(`${this.path}/${this.fileName}`, JSON.stringify(this.hash))
                .then(resolve, reject);
        }));
    }

    get(key, defaultValue) {
        return new Promise((resolve, reject) => {
            this.getAll().then((hash) => {
                resolve(hash[key] || defaultValue);
            }, reject);
        });
    }

    set(key, value) {
        return new Promise((resolve, reject) => {
            this.getAll().then((hash) => {
                hash[key] = value;

                this.saveAll().then(resolve, reject);
            });
        });
    }

    remove(key) {
        return new Promise((resolve, reject) => {
            this.getAll().then((hash) => {
                delete hash[key];

                this.saveAll().then(resolve, reject);
            });
        });
    }
}

export default BaseStorage;
