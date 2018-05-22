function getAppName() {
    return require('../../../../package.json').name
}

function getAppsDataDir(){
    switch(window.nw.process.platform){
        case 'win32': return window.nw.process.env.LOCALAPPDATA + "/" + getAppName();
        case 'linux': return window.nw.process.env.HOME + '/.config' + "/" + getAppName();
        case 'darwin': return window.nw.process.env.HOME + '/Library/Application Support' + "/" + getAppName();
        default: throw Error("unknown platform "+window.nw.process.platform);
    }
}

class FileStorageAdapter {
    fs = window.require('fs');
    desktopApp = null;

    constructor() {
        //this.desktopApp = require('core/desktop_app.js');
    }

    getAppDataDir() {
        return getAppsDataDir(); //this.desktopApp.getAppDataDir();
    }

    prepareDir(path) {
        return new Promise(((resolve, reject) => {
            this.fs.exists(path, (exists) => {
                if (exists) {
                    resolve();
                } else {
                    fs.mkdir(path, (err) => {
                        if (!err) {
                            resolve();
                        } else {
                            reject(err);
                        }
                    });
                }
            })
        }));
    }

    read(path) {
        return new Promise((resolve, reject) => {
            this.fs.readFile(path, "utf8", (err, data) => {
                if (err) {
                    return reject(err);
                }

                return resolve(data);
            })
        });
    }

    remove(path) {
        return new Promise((resolve, reject) => {
            this.fs.unlink(path, (err) => {
                if (err) {
                    return reject(err);
                }

                return resolve();
            })
        });
    };

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
    getAppDataDir() {
        return '';
    }

    prepareDir(path) {
        return new Promise(((resolve, reject) => {
            resolve();
        }));
    }

    read(path) {
        return new Promise((resolve, reject) => {
            return resolve("{}");
        });
    }

    remove(path) {
        return new Promise((resolve, reject) => {
            return resolve();
        });
    };

    write(path, value) {
        return new Promise((resolve, reject) => {
            return resolve();
        });
    }
}

export default window && window.nw ? FileStorageAdapter : BrowserFileStorageAdapter;
