import fs from 'fs';
import os from 'os';

class WebFileStorageAdapter {
    async get(path) {
        const dir = this.getDir();

        return new Promise((resolve, reject) => {
            fs.readFile(`${dir}/${path}`, (err, data) => {
                if (err) {
                    return reject(err);
                }

                return resolve(data);
            })
        });
    }

    set(path, value) {
        return this.create(path, value);
    }

    getDir() {
        return os.homedir();
    }

    async remove(path) {
        const dir = this.getDir();

        return new Promise((resolve, reject) => {
            fs.unlink(`${dir}/${path}`, (err) => {
                if (err) {
                    return reject(err);
                }

                return resolve();
            })
        });
    };

    async create(path, value) {
        const dir = this.getDir();

        return new Promise((resolve, reject) => {
            fs.writeFile(`${dir}/${path}`, value, 'utf8', (err) => {
                if (err) {
                    return reject(err);
                }

                return resolve();
            })
        });
    }
}

export default WebFileStorageAdapter;
