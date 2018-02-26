(function () {
  'use strict';

  angular.module('copayApp.services').factory('witnessListService', () => {
    const root = {};
    root.currentWitness = null;
    return root;
  });
}());
