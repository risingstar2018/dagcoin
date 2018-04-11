(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('LogSettingsModalCtrl', LogSettingsModalCtrl);

  LogSettingsModalCtrl.$inject = ['$scope', '$rootScope', 'configService', 'utilityService', 'historicLog', 'lodash'];

  function LogSettingsModalCtrl($scope, $rootScope, configService, utilityService, historicLog, lodash) {
    const changeLevelClasses = (selectedLevel) => {
      const thresholdLevelValue = historicLog.getLevelValue(selectedLevel);
      lodash.forOwn($scope.levelClasses, (value, key) => {
        $scope.levelClasses[key] = 'passive';
        if (historicLog.getLevelValue(key) >= thresholdLevelValue) {
          $scope.levelClasses[key] = 'active';
        }
        if (selectedLevel === key) {
          $scope.levelClasses[key] += ' selected';
        }
      });
    };

    /**
     * For animation on modal window
     *
     * @type {{error: string, warn: string, info: string, debug: string}}
     */
    $scope.levelClasses = {
      error: 'passive',
      warn: 'passive',
      info: 'passive',
      debug: 'passive'
    };

    $scope.changeLevel = (level) => {
      configService.set({ logLevel: level }, () => { });
      changeLevelClasses(level);
      $scope.$emit('Local/LogLevelChanged', level);
    };

    const removeListener = $rootScope.$on('ngDialog.opened', () => {
      const config = configService.getSync();
      changeLevelClasses(config.logLevel);

      /**
       * send by email is added to pop up menu as hidden.
       * In desktop mode, angular displays it and after a while removes. This seems ugly.
       * So that firstly menu item is hidden, if system is cordova the dni class is removed in order to displayed.
       */
      if (utilityService.isCordova) {
        document.getElementById('sendLogByEmail-li').classList.remove('dni');
      }

      removeListener();
    });
  }
})();
