(() => {
  'use strict';

  /**
   * @name DagCoin Navigation Bar
   * @desc Navigation bar located at the top of each page
   * @example <dag-nav-bar title="Language" invert goBack="preferencesSystem"></dag-nav-bar>
   */
  angular
    .module('copayApp.directives')
    .directive('dagNavBar', dagNavBar);

  dagNavBar.$inject = ['$state', '$rootScope', '$stateParams'];

  function dagNavBar($state, $rootScope, $stateParams) {
    return {
      restrict: 'E',
      templateUrl: 'directives/dagNavBar/dagNavBar.template.html',
      transclude: true,
      replace: true,
      scope: {
        title: '@',
        goBack: '@',
        goBackParams: '@',
        goBackTransition: '@',
        invert: '&'
      },
      link: ($scope, elem, attr) => {
        $scope.invert = ('invert' in attr);
        $scope.showBack = (!!$stateParams.backTo || !!$scope.goBack);
        $scope.goStateBack = () => {
          if ($scope.goBackParams) {
            $state.go($stateParams.backTo || $scope.goBack || 'wallet', JSON.parse($scope.goBackParams));
          } else {
            $state.go($stateParams.backTo || $scope.goBack || 'wallet');
          }
        };

        $scope.openMenu = () => $rootScope.openMenu();
        $scope.openNotifications = () => $rootScope.openNotifications();

        /* document.addEventListener('backbutton', () => {
          back();
        }, false); */
      }
    };
  }
})();
