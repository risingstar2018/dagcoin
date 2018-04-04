(() => {
  'use strict';

  /**
   * @desc Applies background style
   * @example <dag-background></dag-background>
   */
  angular
  .module('copayApp.directives')
  .directive('dagBackground', dagBackground);

  dagBackground.$inject = [];

  function dagBackground() {
    return {
      restrict: 'E',
      scope: false,
      transclude: true,
      templateUrl: 'directives/dagBackground/dagBackground.template.html',
      link: () => {}
    };
  }
})();
