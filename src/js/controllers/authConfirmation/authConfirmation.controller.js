/* eslint-disable new-cap, no-undef */
(function () {
  'use strict';

  /*
   This is incomplete!
   Todo:
   - modify bitcore to accept string indexes
   - add app column to my_addresses table
   - add choice of cosigners when m<n
   - implement signAuthRequest()
   - update handling of "sign" command in cosigners so that they accept auth requests, not just payments
   - post the result to site url
   - allow to change keys of the wallet, update definitions for all apps/domains saved so far
   - send the chain of key changes with the response
   */

  angular
    .module('copayApp.controllers')
    .controller('AuthConfirmationCtrl', AuthConfirmationCtrl);

  AuthConfirmationCtrl.$inject = ['$scope', 'profileService', 'go', 'authService', 'lodash'];

  function AuthConfirmationCtrl($scope, profileService, go, authService, lodash) {
    const Bitcore = require('bitcore-lib');
    const ecdsaSig = require('core/signature.js');
    const bbWallet = require('core/wallet.js');

    const vm = this;
    const objRequest = authService.objRequest;
    // todo allow to choose the devices that are to sign
    const arrSigningDeviceAddresses = [];
    let appName;
    // the wallet to sign with
    vm.walletId = profileService.focusedClient.credentials.walletId;

    if (!objRequest) {
      throw Error('no request');
    }

    if (objRequest.app) {
      appName = objRequest.app;
    } else if (objRequest.url) {
      appName = extractDomainFromUrl(objRequest.url);
    } else {
      throw Error('neither app nor url');
    }

    if (objRequest.question) {
      vm.question = objRequest.question;
    } else {
      vm.question = `Log in to ${appName}?`;
    }

    vm.no = () => go.walletHome();

    vm.yes = function () {
      const credentials = lodash.find(profileService.profile.credentials, { walletId: $scope.walletId });
      if (!credentials) {
        throw Error(`unknown wallet: ${$scope.walletId}`);
      }
      const coin = (credentials.network === 'livenet' ? '0' : '1');

      const signWithLocalPrivateKey = function (walletId, account, isChange, addressIndex, textToSign, handleSig) {
        const path = `m/44'/${coin}'/${account}'/${isChange}/${addressIndex}`;
        // todo unlock the key if encrypted
        const xPrivKey = new Bitcore.HDPrivateKey.fromString(profileService.focusedClient.credentials.xPrivKey);
        const privateKey = xPrivKey.derive(path).privateKey;
        const privKeyBuf = privateKey.bn.toBuffer({ size: 32 }); // https://github.com/bitpay/bitcore-lib/issues/47
        handleSig(ecdsaSig.sign(textToSign, privKeyBuf));
      };
      // create a new app/domain-bound address if not created already
      bbWallet.issueOrSelectAddressForApp(credentials.walletId, app_name, () => {
        bbWallet.signAuthRequest(credentials.walletId, objRequest, arrSigningDeviceAddresses, signWithLocalPrivateKey, () => {
          go.walletHome();
        });
      });
    };

    function extractDomainFromUrl(url) {
      const domainWithPath = url.replace(/^https?:\/\//i, '');
      let domain = domainWithPath.replace(/\/.*$/, '');
      domain = domain.replace(/^www\./i, '');
      return domain;
    }
  }
}());
