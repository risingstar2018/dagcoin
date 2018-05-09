(function () {
  'use strict';

  angular.module('copayApp.services').factory('txFormatService', (profileService, configService, lodash) => {
    const root = {};
    const formatAmountStr = function (amount) {
      if (!amount) {
        return;
      }
      return profileService.formatAmount(amount);
    };

    const formatFeeStr = function (fee) {
      if (!fee) {
        return;
      }
      return `${fee} bytes`;
    };

    root.processTx = function (tx) {
      if (!tx) {
        return '';
      }

      const outputs = tx.outputs ? tx.outputs.length : 0;
      if (outputs > 1 && tx.action !== 'received') {
        tx.hasMultiplesOutputs = true;
        tx.recipientCount = outputs;
        tx.amount = lodash.reduce(tx.outputs, (total, o) => {
          o.amountStr = formatAmountStr(o.amount, tx.asset);
          return total + o.amount;
        }, 0);
      }

      tx.amountStr = formatAmountStr(tx.amount, tx.asset);
      tx.feeStr = formatFeeStr(tx.fee || tx.fees);

      return tx;
    };

    return root;
  });
}());
