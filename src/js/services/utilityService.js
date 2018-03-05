(function () {
  'use strict';

  angular.module('copayApp.services').factory('utilityService', (lodash, Device) => {
    const root = {};
    const regexStartWithPunctuationMark = /^[!@#$%^&*()-=_+|;'`:",.<>?']/i;
    root.isCordova = Device.cordova;
    root.sortWalletsByName = function (wallets) {
      return lodash.sortBy(wallets, (wallet) => {
        const name = wallet.name.toUpperCase();
        if (name.match(regexStartWithPunctuationMark)) {
          return `!${name}`;
        }
        return name;
      });
    };

    /**
     * 01 -> 0.1
     * 000001 -> 0.00001
     * 000.001 ->  0.001
     *
     * @param viewValue must be numeric, otherwise returned viewValue without modified
     * @return If viewValue starts with zero and has no "," or ".", then "." is inserted after first 0
     */
    root.normalizeAmount = function (viewValue) {
      const regexStartsWithZeroNotIncludeDotComma = /^0[0-9]+$/g;
      if (lodash.isEmpty(viewValue)) {
        return viewValue;
      }
      const viewValueTrimmed = viewValue.trim();
      if (viewValueTrimmed.match(regexStartsWithZeroNotIncludeDotComma)) {
        return root.insertIntoString(viewValueTrimmed, '.', 1);
      }
      return viewValueTrimmed;
    };

    root.insertIntoString = function (string, replace, position) {
      if (lodash.isEmpty(string)) {
        return string;
      }
      return [string.slice(0, position), replace, string.slice(position)].join('');
    };

    return root;
  });
}());
