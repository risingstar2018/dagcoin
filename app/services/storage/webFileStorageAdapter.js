import fs from 'fs';
import os from 'os';
import path from 'path';

import { Platform } from 'react-native';

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
        return Platform.OS === 'web' ? nw.App.dataPath: os.homedir();
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

    async create(file, value) {
        const dir = this.getDir();

        const filePath = path.join(dir, file);

        return new Promise((resolve, reject) => {
            fs.writeFile(filePath, value.toString(), 'utf8', (err) => {
                console.log(err.message);
                if (err) {
                    return reject(err);
                }

                return resolve();
            })
        });
    }
}

export default WebFileStorageAdapter;
