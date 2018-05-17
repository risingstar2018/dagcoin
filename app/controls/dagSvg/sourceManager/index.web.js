const SvgBase64Prefix = "data:image/svg+xml;base64,";

class Parser {
    content: null;

    constructor(content) {
        this.content = content;
    }

    static fromBase64(base64) {
        return Buffer.from(base64.replace(SvgBase64Prefix, ''), 'base64').toString('ascii');
    }

    static toBase64(content) {
        return `${SvgBase64Prefix}${Buffer.from(content).toString('base64')}`;
    }
}


const resolveAssetSource = (source) => {
    if (typeof source === "object") {
        return source.uri;
    } else {
        return { uri: source };
    }
};

function fetchSvg (uri) {
    const doc = Parser.fromBase64(uri);
    return new Promise(((resolve, reject) => {
        resolve(doc);
    }));
}

export {resolveAssetSource, fetchSvg};
