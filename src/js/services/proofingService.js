/* eslint-disable import/no-unresolved */
(function () {
  'use strict';

  angular.module('copayApp.services').factory('proofingService', (profileService, addressService, $rootScope) => {
    const root = {};

    root.readCurrentAddress = function () {
      const db = require('byteballcore/db.js');

      const walletId = profileService.focusedClient.credentials.walletId;
      const signingPath = 'r';

      return new Promise((resolve, reject) => {
        addressService.getAddress(walletId, false, (err, address) => {
          if (!address) {
            reject('NO CURRENT ADDRESSES AVAILABLE');
          } else {
            resolve(address);
          }
        });
      }).then((currentAddress) => {
        console.log(`CURRENT ADDRESS FOUND: ${currentAddress}`);
        return new Promise((resolve, reject) => {
          db.query(
            'SELECT address, wallet, account, is_change, address_index, full_approval_date, device_address, definition ' +
            'FROM my_addresses JOIN wallets USING(wallet) JOIN wallet_signing_paths USING(wallet) ' +
            'WHERE address=? AND signing_path=?',
            [currentAddress, signingPath],
            (rows) => {
              if (!rows || rows.length === 0) {
                reject(`CURRENT ADDRESS DEFINITION NOT FOUND FOR WALLET ${walletId} AND ADDRESS ${currentAddress}`);
              }

              if (rows.length > 1) {
                reject(`TOO MANY CURRENT ADDRESS DEFINITIONS FOUND FOR WALLET ${walletId} AND ADDRESS ${currentAddress}: ${rows.length}`);
              }

              resolve(rows[0]);
            });
        });
      });
    };

    root.readMasterAddress = function () {
      const db = require('byteballcore/db.js');

      const walletId = profileService.focusedClient.credentials.walletId;
      const signingPath = 'r';

      return new Promise((resolve, reject) => {
        db.query(
          'SELECT address ' +
          'FROM my_addresses ' +
          'WHERE is_change = 0 ' +
          'AND address_index = 0 ' +
          'AND wallet = ?',
          [walletId],
          (rows) => {
            if (!rows || rows.length === 0) {
              reject(`MASTER ADDRESS NOT FOUND FOR WALLET ${walletId}`);
            }

            if (rows.length > 1) {
              reject(`TOO MANY MASTER ADDRESSES FOR WALLET ${walletId}: ${rows.length}`);
            }

            resolve(rows[0].address);
          }
        );
      }).then((masterAddress) => {
        console.log(`MASTER ADDRESS FOUND: ${masterAddress}`);
        return new Promise((resolve, reject) => {
          db.query(
            'SELECT address, wallet, account, is_change, address_index, full_approval_date, device_address, definition ' +
            'FROM my_addresses JOIN wallets USING(wallet) JOIN wallet_signing_paths USING(wallet) ' +
            'WHERE address=? AND signing_path=?',
            [masterAddress, signingPath],
            (rows) => {
              if (!rows || rows.length === 0) {
                reject(`MASTER ADDRESS DEFINITION NOT FOUND FOR WALLET ${walletId} AND ADDRESS ${masterAddress}`);
              }

              if (rows.length > 1) {
                reject(`TOO MANY MASTER ADDRESS DEFINITIONS FOUND FOR WALLET ${walletId} AND ADDRESS ${masterAddress}: ${rows.length}`);
              }

              resolve(rows[0]);
            });
        });
      });
    };

    root.proofCurrentAddress = () => {
      return root.readCurrentAddress().then(currentAddressObject =>
        root.readMasterAddress().then((masterAddress) => {
          if (currentAddressObject.address !== masterAddress.address) {
            currentAddressObject.master_address = masterAddress.address;
          }

          return Promise.resolve(currentAddressObject);
        })
      ).then((currentAddressObject) => {
        const proof = {
          address: currentAddressObject.address,
          address_definition: currentAddressObject.definition
        };

        return root.signWithCurrentAddress(currentAddressObject.device_address).then((deviceAddressSignature) => {
          proof.device_address_signature = deviceAddressSignature;

          if (currentAddressObject.master_address) {
            return root.signWithMasterAddress(proof.address).then((masterAddressSignature) => {
              proof.master_address_signature = masterAddressSignature;
              proof.master_address = currentAddressObject.master_address;

              return Promise.resolve(proof);
            });
          }

          return Promise.resolve(proof);
        });
      });
    };

    root.signWithMasterAddress = (text) => {
      const xPrivKey = profileService.focusedClient.credentials.xPrivKey;

      return root.readMasterAddress().then((master) => {
        const Bitcore = require('bitcore-lib');
        const PrivateKey = require('bitcore-lib/lib/privatekey');
        const ecdsaSig = require('byteballcore/signature.js');

        const path = `m/44'/0'/${master.account}'/${master.is_change}/${master.address_index}`;
        const privateKey = new Bitcore.HDPrivateKey.fromString(xPrivKey).derive(path);
        const privKeyBuf = privateKey.privateKey.bn.toBuffer({ size: 32 }); // https://github.com/bitpay/bitcore-lib/issues/47

        if (!PrivateKey.isValid(privateKey.privateKey)) {
          const Networks = require('bitcore-lib/networks');
          const error = PrivateKey.getValidationError(xPrivKey, Networks.defaultNetwork);
          if (error) {
            return Promise.reject(`INVALID PRIVATE KEY (${xPrivKey}) : ${error}`);
          }
        }

        const crypto = require('crypto');
        const bufToSign = crypto.createHash('sha256').update(text, 'utf8').digest();

        return Promise.resolve(ecdsaSig.sign(bufToSign, privKeyBuf));
      });
    };

    root.signWithCurrentAddress = (text) => {
      const xPrivKey = profileService.focusedClient.credentials.xPrivKey;

      return root.readCurrentAddress().then((current) => {
        const Bitcore = require('bitcore-lib');
        const PrivateKey = require('bitcore-lib/lib/privatekey');
        const ecdsaSig = require('byteballcore/signature.js');

        const path = `m/44'/0'/${current.account}'/${current.is_change}/${current.address_index}`;
        const privateKey = new Bitcore.HDPrivateKey.fromString(xPrivKey).derive(path);
        const privKeyBuf = privateKey.privateKey.bn.toBuffer({ size: 32 }); // https://github.com/bitpay/bitcore-lib/issues/47

        if (!PrivateKey.isValid(privateKey.privateKey)) {
          const Networks = require('bitcore-lib/networks');
          const error = PrivateKey.getValidationError(xPrivKey, Networks.defaultNetwork);
          if (error) {
            return Promise.reject(`INVALID PRIVATE KEY (${xPrivKey}) : ${error}`);
          }
        }

        const crypto = require('crypto');
        const bufToSign = crypto.createHash('sha256').update(text, 'utf8').digest();

        return Promise.resolve(ecdsaSig.sign(bufToSign, privKeyBuf));
      });
    };

    $rootScope.$on('Local/BalanceUpdatedAndWalletUnlocked', () => {
      const eventBus = require('byteballcore/event_bus.js');
      const db = require('byteballcore/db.js');
      const device = require('byteballcore/device');

      eventBus.on('dagcoin.request.proofing', (message, fromAddress) => {
        console.log(`NEW PROOFING REQUEST FROM ${fromAddress}: ${JSON.stringify(message)}`);

        let errors = [];

        if (!message.addresses || message.addresses === 0) {
          errors.push('No addresses specified for proofing');
        } else {

        }

        device
        // IS IT ONE OF MY ADDRESSES?
        db.query('SELECT address FROM my_addresses', [], );
      });
    });

    return root;
  });
}());
