// const bwcModule = angular.module('bwcModule', []);
// var Client = require('../node_modules/bitcore-wallet-client');
console.log('before');
// console.log("path="+require.resolve('./bitcore-wallet-client/bitcore-wallet-client/bwc.service.js'));
// we are in public/, require() from webkit context
const Client = require('./bitcore-wallet-client/index');

console.log('after');

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
