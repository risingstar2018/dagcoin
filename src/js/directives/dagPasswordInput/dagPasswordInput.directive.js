/* eslint-disable no-undef */
(() => {
  'use strict';

  /**
   * @example <dag-password-input></dag-password-input>
   */
  angular
  .module('copayApp.directives')
  .directive('dagPasswordInput', dagPassword);

  dagPassword.$inject = ['$timeout', 'utilityService'];

  function dagPassword($timeout, utilityService) {
    return {
      restrict: 'E',
      templateUrl: 'directives/dagPasswordInput/dagPasswordInput.template.html',
      replace: true,
      require: 'ngModel',
      scope: {
        inputType: '=',
        ngChange: '&',
        placeholder: '=',
        id: '=',
        name: '=',
        canSetVisible: '=',
        ngModel: '=',
        autoFocus: '='
      },
      link: ($scope) => {
        $scope.onChangeTimeout = null;
        $scope.id = $scope.id || '';
        $scope.placeholder = $scope.placeholder || '';
        $scope.name = $scope.name || '';

        // force password field's type to 'password', ignore inputType parameter of directive
        // Phones do not suggest words for fields whose type is 'password'
        if (utilityService.isCordova) {
          $scope.inputType = 'password';
        } else {
          $scope.inputType = $scope.inputType || 'text';
        }

        $scope.canSetVisible = $scope.canSetVisible !== false;
        $scope.autoFocus = $scope.autoFocus === true;
        $scope.passwordVisible = false;

        /**
         * Disable password element in case of password is visible, otherwise enable
         * @param input password input html element
         */
        const setEnablement = function (input) {
          const passEle = $(input);
          if ($scope.passwordVisible) {
            passEle.attr('disabled', 'disabled');
          } else {
            passEle.removeAttr('disabled');
            passEle.focus();
          }
        };

        $scope.setInputType = function (type) {
          const input = document.getElementById($scope.id);
          if (!input) {
            return;
          }
          input.type = type;
          setEnablement(input);
        };

        $scope.setFocus = function () {
          const input = document.getElementById($scope.id);
          if (!input) {
            return;
          }
          input.focus();
        };

        $scope.toggle = function () {
          $scope.passwordVisible = !$scope.passwordVisible;
          $scope.setInputType($scope.passwordVisible ? 'text' : $scope.inputType);
        };

        $scope.onChange = function () {
          if ($scope.onChangeTimeout) {
            $timeout.cancel($scope.onChangeTimeout);
          }

          $scope.onChangeTimeout = $timeout(() => {
            if ($scope.ngChange) {
              $scope.ngChange();
            }
          }, 100);
        };

        $timeout(() => {
          if ($scope.autoFocus) {
            $scope.setFocus();
          }
        }, 1);
      }
    };
  }
})();
