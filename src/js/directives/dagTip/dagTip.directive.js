(() => {
  'use strict';

  /**
   * @desc directive to display block tips
   * @example <dag-tip heading="Title" body="Text" link="URL|Hash"></dag-tip>
   */
  angular
    .module('copayApp.directives')
    .directive('dagTip', dagTip);

  dagTip.$inject = [];

  function dagTip() {
    return {
      restrict: 'E',
      replace: true,
      template: '<div class="dag_tip p20" ng-class="{\'no_icon\' : !icon}"><svg-icon name="{{icon}}" ng-if="icon"></svg-icon><h4>{{heading}}</h4><p>{{body}}</p><a ng-if="linkText" href="{{linkUrl}}">{{linkText}}</a></div>',
      scope: {
        heading: '@',
        body: '@',
        linkText: '@',
        linkUrl: '@',
        icon: '@'
      },
      link: () => {

      }
    };
  }
})();
