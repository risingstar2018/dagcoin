import FileStorage from './fileStorage/index';

class StorageService {
    fileName = 'settings.json';
    path = null;
    settings = null;

    constructor() {
      this.storage = new FileStorage();
      this.path = this.storage.getAppDataDir();
    }

    accessor(key, value) {
      return (value ? this.set(key, value) : this.get(key));
    }

    getSettings() {
      return new Promise(((resolve, reject) => {
        if (this.settings) {
          resolve(this.settings);
        }

        this.storage.read(`${this.path}/${this.fileName}`).then((result) => {
          const json = JSON.parse(result);
          this.settings = json;
          resolve(this.settings);
        }, () => {
          resolve({});
        });
      }));
    }

    set(key, value) {
      return new Promise(((resolve, reject) => {
        this.getSettings().then((settings) => {
          settings[key] = value;

          this.storage.write(`${this.path}/${this.fileName}`, JSON.stringify(settings))
            .then(resolve, reject);
        });
      }));
    }

    get(key) {
      return new Promise(((resolve, reject) => {
        this.storage.read(`${this.path}/${this.fileName}`).then((result) => {
          const json = JSON.parse(result);
          resolve(json[key]);
        }, reject);
      }));
    }

    remove(key) {
      return new Promise(((resolve, reject) => {
        this.getSettings().then((settings) => {
          delete settings[key];
          this.storage.write(`${this.path}/${this.fileName}`, JSON.stringify(settings))
            .then(resolve, reject);
        });
      }));
    }
}

export default StorageService;
