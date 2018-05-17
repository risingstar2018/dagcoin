import rnfs from 'react-native-fs';

class RNOS {
    static get homedir() {
        return rnfs.DocumentDirectoryPath;
    }
}

module.exports = {RNOS};
