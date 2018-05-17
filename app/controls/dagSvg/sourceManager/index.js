import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';

function fetchSvg (uri) {
    return new Promise((resolve, reject) => {
        fetch(uri).then((response) => {
            response.text().then((text) => {
                resolve(text);
            });
        });
    });
}

export {resolveAssetSource, fetchSvg};
