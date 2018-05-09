(() => {
  'use strict';

  /**
   * @name Dagcoin notifications
   * @example <dag-notification></dag-notification>
   */
  angular
  .module('copayApp.directives')
  .directive('dagNotifications', notifications);

  notifications.$inject = ['notification'];

  function notifications(notification) {
    function link(scope, element, attrs) {
      let position = attrs.dagNotifications;
      position = position.split(' ');
      element.addClass('dr-notification-container');
      for (let i = 0; i < position.length; i += 1) {
        element.addClass(position[i]);
      }
    }

    return {
      restrict: 'A',
      scope: {},
      templateUrl: 'directives/dagNotification/dagNotification.template.html',
      link,
      controller: ['$scope',
        function NotificationsCtrl($scope) {
          $scope.queue = notification.getQueue();

          $scope.removeNotification = function (noti) {
            $scope.queue.splice($scope.queue.indexOf(noti), 1);
          };
        },
      ],

    };
  }
})();
