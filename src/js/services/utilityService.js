(function () {
  'use strict';

  angular.module('copayApp.services').factory('utilityService', (lodash) => {
    const root = {};
    const regexStartWithPunctuationMark = /^[!@#$%^&*()-=_+|;'`:",.<>?']/i;

    root.sortWalletsByName = function (wallets) {
      return lodash.sortBy(wallets, (wallet) => {
        const name = wallet.name.toUpperCase();
        if (name.match(regexStartWithPunctuationMark)) {
          return `!${name}`;
        }
        return name;
      });
    };

    return root;
  });
}());
