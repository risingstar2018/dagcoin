/* global angular */
(function () {
  'use strict';

  const ValidationUtils = require('byteballcore/validation_utils.js');

  /**
   * @desc validating DAG address
   * @example <input type="text" valid-address>
   */
  angular
    .module('dagcoin.directives')
    .directive('validAddress', validAddress);

  validAddress.$inject = ['$rootScope', 'profileService'];

  function validAddress($rootScope, profileService) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link(scope, elem, attrs, ctrl) {
        const validator = (value) => {
          if (!profileService.focusedClient) {
            return '';
          }

          if (typeof value === 'undefined') {
            ctrl.$pristine = true;
            return '';
          }

          // Regular Address
          ctrl.$setValidity('validAddress', ValidationUtils.isValidAddress(value));
          return value;
        };

        ctrl.$parsers.unshift(validator);
        ctrl.$formatters.unshift(validator);
      },
    };
  }
}());
