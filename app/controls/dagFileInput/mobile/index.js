import {DocumentPicker, DocumentPickerUtil} from "react-native-document-picker";

const select = () => {
    return new Promise((resolve, reject) => {
        DocumentPicker.show({
            filetype: [DocumentPickerUtil.allFiles()],
        },(error, res) => {
            if (res) {
                resolve({
                    uri: res.uri,
                    type: res.type,
                    name: res.fileName,
                    size: res.fileSize
                });
            } else {
                reject();
            }
        });
    })
};

export {select};
