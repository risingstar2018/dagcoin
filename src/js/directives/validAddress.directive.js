/* global angular */
(function () {
  'use strict';

  const ValidationUtils = require('byteballcore/validation_utils.js');

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
          if (!profileService.focusedClient) {
            return '';
          }

          if (typeof value === 'undefined') {
            ctrl.$pristine = true;
            return '';
          }

          // Regular url
          if (/^https?:\/\//.test(value)) {
            ctrl.$setValidity('validAddress', true);
            return '';
          }

          // byteball uri
          const conf = require('byteballcore/conf.js');
          const re = new RegExp(`^${conf.program}:([A-Z2-7]{32})\b`, 'i');
          const arrMatches = value.match(re);
          if (arrMatches) {
            ctrl.$setValidity('validAddress', ValidationUtils.isValidAddress(arrMatches[1]));
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
