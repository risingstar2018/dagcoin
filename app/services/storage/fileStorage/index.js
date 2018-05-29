import rnfs from 'react-native-fs';

class FileStorageAdapter {
  getAppDataDir() {
    return rnfs.DocumentDirectoryPath;
  }

  read(path) {
    return rnfs.readFile(path);
  }

  write(path, value) {
    return rnfs.writeFile(path, value, 'utf8');
  }

  remove(path) {
    return rnfs.unlink(path);
  }
}

export default FileStorageAdapter;
