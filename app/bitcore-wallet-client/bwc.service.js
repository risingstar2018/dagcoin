// we are in public/, require() from webkit context

const Client = null //require('./bitcore-wallet-client/index');

// bwcModule.constant('MODULE_VERSION', '1.0.0');

class BwcService {
    constructor() {
    }

    getBitcore() {
        return Client.Bitcore;
    }

    getSJCL() {
        return Client.sjcl;
    }

    getUtils() {
        return Client.Utils;
    }

    getClient(walletData) {
        const bwc = new Client({});
        if (walletData) {
            bwc.import(walletData);
        }
        return bwc;
    }
}

export default new BwcService();
