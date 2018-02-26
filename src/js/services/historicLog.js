(function () {
  'use strict';

  const logs = [];
  angular.module('copayApp.services')
  .factory('historicLog', () => {
    const root = {};
    root.add = (level, msg) => logs.push({ level, msg });
    root.get = () => logs;
    return root;
  });
}());
