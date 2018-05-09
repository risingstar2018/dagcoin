(function () {
  'use strict';

  angular.module('copayApp.services')
  .factory('logHeader', ($log, Device, nodeWebkit) => {
    $log.info(`Starting Dagcoin v${window.version} #${window.commitHash}`);
    $log.info('Client: isCordova:', Device.cordova, 'isNodeWebkit:', nodeWebkit.isDefined());
    $log.info('Navigator:', navigator.userAgent);
    return {};
  });
}());
