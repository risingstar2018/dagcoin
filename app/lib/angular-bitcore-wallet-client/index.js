import Client from './bitcore-wallet-client/index.js';

class BitcoreWallet {
    static getBitcore() {
        return Client.Bitcore;
    }

    static getSJCL() {
        return Client.sjcl;
    }

    static getClient(walletData) {
        const bwc = new Client({});
        if (walletData) {
            bwc.import(walletData);
        }
        return bwc;
    }
}

export default BitcoreWallet;
