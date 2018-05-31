class FileStorageAdapter {
    fs = window.require('fs');
    desktopApp = require('core/desktop_app');

    getAppDataDir() {
      return this.desktopApp.getAppDataDir();
    }

    prepareDir(path) {
      return new Promise(((resolve, reject) => {
        this.fs.exists(path, (exists) => {
          if (exists) {
            resolve();
          } else {
            this.fs.mkdir(path, (err) => {
              if (!err) {
                resolve();
              } else {
                reject(err);
              }
            });
          }
        });
      }));
    }

    read(path) {
      return new Promise((resolve, reject) => {
        this.fs.readFile(path, 'utf8', (err, data) => {
          if (err) {
            return reject(err);
          }

          return resolve(data);
        });
      });
    }

    remove(path) {
      return new Promise((resolve, reject) => {
        this.fs.unlink(path, (err) => {
          if (err) {
            return reject(err);
          }

          return resolve();
        });
      });
    }

    write(path, value) {
      return new Promise((resolve, reject) => {
        this.fs.writeFile(path, value, 'utf8', (err) => {
          if (err) {
            return reject(err);
          }

          return resolve();
        });
      });
    }
}

class BrowserFileStorageAdapter {
    cache = '{}';

    getAppDataDir() {
      return '';
    }

    prepareDir(path) {
      return new Promise(((resolve, reject) => {
        resolve();
      }));
    }

    read(path) {
      return new Promise((resolve, reject) => resolve(this.cache));
    }

    remove(path) {
      return new Promise((resolve, reject) => {
        this.cache = '{}';
        return resolve();
      });
    }

    write(path, value) {
      return new Promise((resolve, reject) => {
        this.cache = value;
        return resolve();
      });
    }
}

export default window && window.nw ? FileStorageAdapter : BrowserFileStorageAdapter;
