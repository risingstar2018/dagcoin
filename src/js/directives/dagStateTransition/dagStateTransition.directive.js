(() => {
  'use strict';

  /**
   * @desc directive to apply transition classes to section view for a CSS animation
   * @example <a dag-state-transition="slide-left"></a>
   */
  angular
    .module('copayApp.directives')
    .directive('dagStateTransition', dagStateTransition);

  dagStateTransition.$inject = ['$rootScope'];

  function dagStateTransition($rootScope) {
    return {
      restrict: 'A',
      link: ($scope, element, attr) => {
        element.bind('click', () => {
          const sections = document.getElementsByClassName('section');
          const views = angular.element(sections);
          const transition = attr.dagStateTransition;

          $rootScope.viewTransition = transition;

          function removeClass() {
            views.removeClass(transition);
            $rootScope.viewTransition = '';
          }

          angular.forEach(views, (value) => {
            if (transition) {
              angular.element(value).addClass(transition);
              value.addEventListener('transitionend', removeClass, false);
              value.addEventListener('webkitTransitionEnd', removeClass, false);
              value.addEventListener('animationend', removeClass, false);
              value.addEventListener('webkitAnimationEnd', removeClass, false);
            }
          });
        });
      }
    };
  }
})();
