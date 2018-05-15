(function () {
  'use strict';

  angular
    .module('copayApp.services')
    .factory('sharedService', sharedService);

  sharedService.$inject = ['$rootScope'];

  /* @ngInject */
  function sharedService($rootScope) {
    const service = {};
    service.balanceStatuses = {
      total: 'total',
      pending: 'pending',
      stable: 'stable'
    };
    service.currentWallet = null;
    service.cachedData = {};
    service.hasBalance = hasBalance;
    service.hasBytes = hasBytes;
    service.getCurrentWallet = getCurrentWallet;
    service.setCurrentWallet = setCurrentWallet;
    service.getCurrentReceiveAddress = getCurrentReceiveAddress;
    service.setCurrentReceiveAddress = setCurrentReceiveAddress;
    service.getCachedData = getCachedData;
    service.addCachedData = addCachedData;

    let currentBalance = null;

    $rootScope.$on('Local/BalanceUpdatedAndWalletUnlocked', (event, ab) => {
      currentBalance = ab;
    });

    function hasBalance(status) {
      return hasBytes(status);
    }

    function hasBytes(status) {
      const st = status || {
          total: 'total',
          pending: 'pending',
          stable: 'stable'
        }.stable;
      return (currentBalance && currentBalance.base && currentBalance.base[st] > 0);
    }

    /**
     *
     * @return {null|*} currently selected wallet
     */
    function getCurrentWallet() {
      return service.currentWallet;
    }

    /**
     *
     * @param wallet {walletId, walletName, alias, shared_address}
     */
    function setCurrentWallet(wallet) {
      service.currentWallet = wallet;
    }

    function getCurrentReceiveAddress() {
      return service.currentReceiveAddress;
    }

    function setCurrentReceiveAddress(addr) {
      service.currentReceiveAddress = addr;
    }

    function addCachedData(key, value) {
      service.cachedData[key] = value;
    }

    function getCachedData(key) {
      return service.cachedData[key];
    }

    return service;
  }
}());

