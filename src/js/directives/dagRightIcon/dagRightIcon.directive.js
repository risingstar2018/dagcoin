(() => {
  'use strict';

  /**
   * @desc locate an icon on the right of the list element
   * @example <li dag-right-icon="shield"></li>
   */
  angular
    .module('copayApp.directives')
    .directive('dagRightIcon', dagRightIcon);

  dagRightIcon.$inject = ['$compile'];

  function dagRightIcon($compile) {
    return {
      restrict: 'A',
      scope: true,
      link: ($scope, element, attr) => {
        element.addClass('right_icon');
        const icon = $compile(`<svg-icon name="${attr.dagRightIcon}"></svg-icon>`)($scope);
        element.append(icon);
      }
    };
  }
})();
