import rnfs from 'react-native-fs';

class WebFileStorageAdapter {
    async get(path) {
        const dir = this.getDir();

        try {
            return await rnfs.readFile(`${dir}/${path}`);
        } catch (e) {
            return false;
        }
    }

    set(path, value) {
        return this.create(path, value);
    }

    getDir() {
        return rnfs.DocumentDirectoryPath;
    }

    async remove(path) {
        const dir = this.getDir();

        try {
            return await rnfs.unlink(`${dir}/${path}`);
        } catch (e) {
            return false;
        }
    };

    async create(path, value) {
        const dir = this.getDir();

        try {
            return await rnfs.writeFile(`${dir}/${path}`, value, 'utf8')
        } catch (e) {
            return false;
        }
    }
}

export default WebFileStorageAdapter;
