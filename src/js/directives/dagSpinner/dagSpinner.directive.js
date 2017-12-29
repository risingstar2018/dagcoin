(() => {
  'use strict';

  /**
   * @desc loading spinner
   * @example <dag-spinner></dag-spinner>
   */
  angular
    .module('copayApp.directives')
    .directive('dagSpinner', dagSpinner);

  dagSpinner.$inject = [];

  function dagSpinner() {
    return {
      restrict: 'E',
      scope: {
        color: '@'
      },
      template: '<div class="loader"></div>',
      link: () => {
      }
    };
  }
})();
