(function () {
  'use strict';

  const logs = [];
  angular.module('dagcoin.services')
  .factory('historicLog', () => {
    const root = {};

    root.add = function (level, msg) {
      logs.push({
        level,
        msg,
      });
    };

    root.get = function () {
      return logs;
    };

    return root;
  });
}());
