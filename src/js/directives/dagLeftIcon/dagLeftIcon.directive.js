(() => {
  'use strict';

  /**
   * @desc locate an icon on the left of the list element
   * @example <li dag-left-icon="shield"></li>
   */
  angular
    .module('copayApp.directives')
    .directive('dagLeftIcon', dagLeftIcon);

  dagLeftIcon.$inject = ['$compile'];

  function dagLeftIcon($compile) {
    return {
      restrict: 'A',
      scope: true,
      link: ($scope, element, attr) => {
        element.addClass('left_icon');
        const icon = $compile(`<svg-icon name="${attr.dagLeftIcon}"></svg-icon>`)($scope);
        element.prepend(icon);
      }
    };
  }
})();
