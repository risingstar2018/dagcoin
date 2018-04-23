(() => {
  'use strict';

  /**
   * @desc Displays version and type of the wallet
   * @example <dag-version-and-type></dag-version-and-type>
   */
  angular
   .module('copayApp.directives')
  .directive('dagVersionAndType', dagVersionAndType);

  dagVersionAndType.$inject = ['gettextCatalog'];

  function dagVersionAndType(gettextCatalog) {
    return {
      restrict: 'E',
      transclude: true,
      replace: true,
      scope: {},
      templateUrl: 'directives/dagVersionAndType/dagVersionAndType.template.html',
      controllerAs: 'versionAndType',
      controller() {
        const self = this;
        const conf = require('core/conf.js');
        self.type = conf.bLight ? gettextCatalog.getString('light wallet') : gettextCatalog.getString('full wallet');
        self.version = window.version;
        self.commitHash = window.commitHash;
      }
    };
  }
})();
