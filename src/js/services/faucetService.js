(function () {
  'use strict';

  angular.module('copayApp.services')
    .factory('faucetService', ($rootScope, $q, ENV) => {
      const self = {};
      let isInitialized = false;

      self.isFaucetAddress = isFaucetAddress;

      const faucetAddresses = [
        ENV.FAUCET_ADDRESS, // testnet faucet
      ];
      if (ENV.isTestnet) {
        $rootScope.$on('Local/BalanceUpdatedAndWalletUnlocked', () => {
          initService();
        });
      }

      function isFaucetAddress(deviceAddress) {
        return !!faucetAddresses.find(obj => obj === deviceAddress);
      }

      function initService() {
        if (isInitialized) {
          return;
        }

        const device = require('core/device.js');
        device.readCorrespondents((list) => {
          const paired = !!list.find(d => !!faucetAddresses.find(obj => obj === d.device_address));

          if (paired) {
            isInitialized = true;
            return;
          }

          addPairDevice(ENV.FAUCET_CORRESPONDENCE_CODE).then(() => {
            isInitialized = true;
          });
        });
      }

      function addPairDevice(pairCode) {
        const defer = $q.defer();

        const device = require('core/device.js');
        const matches = pairCode.match(/^([\w\/+]+)@([\w.:\/-]+)#([\w\/+-]+)$/);
        const pubkey = matches[1];
        const hub = matches[2];
        const pairingSecret = matches[3];

        device.addUnconfirmedCorrespondent(pubkey, hub, 'New', (deviceAddress) => {
          device.startWaitingForPairing((reversePairingInfo) => {
            device.sendPairingMessage(hub,
              pubkey,
              pairingSecret,
              reversePairingInfo.pairing_secret,
              {
                ifOk: () => { },
                ifError: () => { }
              });
          });

          device.readCorrespondent(deviceAddress, (cor) => {
            defer.resolve(cor);
          });
        });

        return defer.promise;
      }

      return self;
    });
}());
