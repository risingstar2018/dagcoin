(() => {
  'use strict';

  /**
   * @desc directive to create and animate sidebars
   * @example <dag-side-bar></dag-side-bar>
   */
  angular
    .module('copayApp.directives')
    .directive('dagSideBar', dagSideBar);

  dagSideBar.$inject = ['$rootScope'];

  function dagSideBar($rootScope) {
    return {
      restrict: 'E',
      transclude: true,
      replace: true,
      template: '<div class="sidebar {{side}}"><div class="sidebar_content"><ng-transclude></ng-transclude></div><div class="sidebar_overlay"></div></div>',
      scope: {
        side: '@'
      },
      link: ($scope, element) => {
        const overlay = element[0].getElementsByClassName('sidebar_overlay')[0];
        let opened = false;
        $scope.side = $scope.side || 'left';
        $rootScope.openSideBar = (side) => {
          if (side === $scope.side) {
            opened = true;
            element.addClass('sidebar--animatable sidebar--visible');
          }
        };

        $rootScope.closeSideBar = () => {
          if (opened) {
            opened = false;
            element.addClass('sidebar--animatable');
            element.removeClass('sidebar--visible');
          }
        };

        angular.element(overlay).on('click', () => {
          if (opened) {
            $rootScope.closeSideBar();
          }
        });

        element.on('transitionend', () => {
          element.removeClass('sidebar--animatable');
        });
      }
    };
  }
})();
