/* global angular */
(function () {
  'use strict';

  /**
   * @desc validating DAG address
   * @example <input type="text" valid-address>
   */
  angular
    .module('copayApp.directives')
    .directive('validAddress', validAddress);

  validAddress.$inject = ['$rootScope', 'profileService'];

  function validAddress($rootScope, profileService) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link(scope, elem, attrs, ctrl) {
        const validator = (value) => {
          const validationUtils = require('core/validation_utils.js');
          if (!profileService.focusedClient) {
            return '';
          }

          if (typeof value === 'undefined') {
            ctrl.$pristine = true;
            return '';
          }

          // Regular Address
          ctrl.$setValidity('validAddress', validationUtils.isValidAddress(value));
          return value;
        };

        ctrl.$parsers.unshift(validator);
        ctrl.$formatters.unshift(validator);
      },
    };
  }
}());
