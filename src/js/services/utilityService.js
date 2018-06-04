(function () {
  'use strict';

  angular.module('copayApp.services').factory('utilityService', (lodash, Device, $timeout, nodeWebkit, gettextCatalog) => {
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
    root.insertIntoString = function (string, replace, position) {
      if (lodash.isEmpty(string)) {
        return string;
      }
      return [string.slice(0, position), replace, string.slice(position)].join('');
    };

    /**
     * @param scope scope of the dom
     * @param address the address to be copied, if empty nothing happens
     */
    root.copyAddress = function (scope, address) {
      if (lodash.isEmpty(address)) {
        return;
      }
      if (root.isCordova) {
        window.cordova.plugins.clipboard.copy(address);
        window.plugins.toast.showShortCenter(gettextCatalog.getString('Copied to clipboard'));
      } else if (nodeWebkit.isDefined()) {
        nodeWebkit.writeToClipboard(address);
      }

      scope.tooltipCopiedShown = true;

      $timeout(() => {
        scope.tooltipCopiedShown = false;
      }, 1000);
    };

    root.getAmountInSmallestUnits = function (amount, asset, unitValue) {
      console.log(amount, asset, unitValue);
      const moneyAmount = amount * self.unitValue;
      return Math.round(moneyAmount);
    };

    root.getAmountInDisplayUnits = function (amount, unitValue) {
      return amount / unitValue;
    };

    root.isMobile = function () {
      return Device.android || Device.iOS;
    };

    /**
     * Problem occurs while directly using password from dag-password directive.
     * So that it is reconstructed again
     * @param password
     * @return {string}
     */
    root.getNormalizedPassword = function (password) {
      let normalizedPassword = '';
      for (let i = 0; i < password.length; i += 1) {
        normalizedPassword += password.charAt(i);
      }
      return normalizedPassword;
    };

    return root;
  });
}());
