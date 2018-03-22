(function () {
  'use strict';

  function selectText(element) {
    const doc = document;
    if (doc.body.createTextRange) { // ms
      const range = doc.body.createTextRange();
      range.moveToElementText(element);
      range.select();
    } else if (window.getSelection) {
      const selection = window.getSelection();
      const range = doc.createRange();
      range.selectNodeContents(element);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  angular.module('copayApp.directives')
  .directive('validUrl', [

    function () {
      return {
        require: 'ngModel',
        link(scope, elem, attrs, ctrl) {
          const validator = function (value) {
            // Regular url
            if (/^https?:\/\//.test(value)) {
              ctrl.$setValidity('validUrl', true);
              return value;
            }
            ctrl.$setValidity('validUrl', false);
            return value;
          };

          ctrl.$parsers.unshift(validator);
          ctrl.$formatters.unshift(validator);
        },
      };
    },
  ])
  .directive('validAmount', ['configService', 'ENV',
    function (configService) {
      return {
        require: 'ngModel',
        link(scope, element, attrs, ctrl) {
          const val = function (value) {
            // const asset = attrs.validAmount;
            const settings = configService.getSync().wallet.settings;
            const unitValue = settings.unitValue;
            const decimals = Number(settings.unitDecimals);

            const vNum = Number((value * unitValue).toFixed(0));

            if (typeof value === 'undefined' || value === 0) {
              ctrl.$pristine = true;
            }

            if (typeof vNum === 'number' && vNum > 0) {
              const sepIndex = (`${value}`).indexOf('.');
              const strValue = (`${value}`).substring(sepIndex + 1);
              if (sepIndex > 0 && strValue.length > decimals) {
                ctrl.$setValidity('validAmount', false);
              } else {
                ctrl.$setValidity('validAmount', true);
              }
            } else {
              ctrl.$setValidity('validAmount', false);
            }
            return value;
          };
          ctrl.$parsers.unshift(val);
          ctrl.$formatters.unshift(val);
        },
      };
    },
  ])
  .directive('loading', () => ({
    restrict: 'A',
    link($scope, element, attr) {
      const a = element.html();
      const text = attr.loading;
      element.on('click', () => {
        element.html(`<i class="size-21 fi-bitcoin-circle icon-rotate spinner"></i> ${text}...`);
      });
      $scope.$watch('loading', (val) => {
        if (!val) {
          element.html(a);
        }
      });
    },
  }))
  .directive('ngFileSelect', () => ({
    restrict: 'A',
    scope: {
      ngFileSelected: '&'
    },
    link($scope, el) {
      el.bind('change', (e) => {
        if ($scope.ngFileSelected) {
          $scope.ngFileSelected({
            file: (e.srcElement || e.target).files[0]
          });
        }
      });
    },
  }))
  .directive('highlightOnChange', () => ({
    restrict: 'A',
    link(scope, element, attrs) {
      scope.$watch(attrs.highlightOnChange, () => {
        element.addClass('highlight');
        setTimeout(() => {
          element.removeClass('highlight');
        }, 500);
      });
    },
  }))
  .directive('checkStrength', () => ({
    replace: false,
    restrict: 'EACM',
    require: 'ngModel',
    link(scope, element, attrs) {
      const MIN_LENGTH = 8;
      const MESSAGES = ['Very Weak', 'Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
      const COLOR = ['#dd514c', '#dd514c', '#faa732', '#faa732', '#16A085', '#16A085'];

      function evaluateMeter(password) {
        let passwordStrength = 0;
        let text;
        if (password.length > 0) passwordStrength = 1;
        if (password.length >= MIN_LENGTH) {
          if ((password.match(/[a-z]/)) && (password.match(/[A-Z]/))) {
            passwordStrength += 1;
          } else {
            text = ', add mixed case';
          }
          if (password.match(/\d+/)) {
            passwordStrength += 1;
          } else if (!text) text = ', add numerals';
          if (password.match(/.[!,@,#,$,%,^,&,*,?,_,~,-,(,)]/)) {
            passwordStrength += 1;
          } else if (!text) text = ', add punctuation';
          if (password.length > 12) {
            passwordStrength += 1;
          } else if (!text) text = ', add characters';
        } else {
          text = ', that\'s short';
        }
        if (!text) text = '';

        return {
          strength: passwordStrength,
          message: MESSAGES[passwordStrength] + text,
          color: COLOR[passwordStrength],
        };
      }

      scope.$watch(attrs.ngModel, (newValue) => {
        if (newValue && newValue !== '') {
          scope[attrs.checkStrength] = evaluateMeter(newValue);
        }
      });
    },
  }))
  .directive('showFocus', $timeout => function (scope, element, attrs) {
    scope.$watch(attrs.showFocus,
      (newValue) => {
        $timeout(() => {
          const isFocused = newValue && element[0].focus();
          return isFocused;
        });
      }, true);
  })
  .directive('match', () => ({
    require: 'ngModel',
    restrict: 'A',
    scope: {
      match: '=',
    },
    link(scope, elem, attrs, ctrl) {
      scope.$watch(() => (ctrl.$pristine && angular.isUndefined(ctrl.$modelValue)) || scope.match === ctrl.$modelValue, (currentValue) => {
        ctrl.$setValidity('match', currentValue);
      });
    },
  }))
  .directive('clipCopy', () => ({
    restrict: 'A',
    scope: {
      clipCopy: '=clipCopy',
    },
    link(scope, elm) {
      // TODO this does not work (FIXME)
      elm.attr('tooltip', 'Press Ctrl+C to Copy');
      elm.attr('tooltip-placement', 'top');

      elm.bind('click', () => {
        selectText(elm[0]);
      });
    },
  }))
  .directive('logo', () => ({
    restrict: 'E',
    scope: {
      width: '@',
      negative: '=',
    },
    controller($scope) {
      // $scope.logo_url = $scope.negative ? 'img/logo-negative.svg' : 'img/logo.svg';
      $scope.logo_url = $scope.negative ? 'img/icons/icon-white-outline.iconset/icon_32x32.png' : 'img/icons/icon-black-32.png';
    },
    replace: true,
    // template: '<img ng-src="{{ logo_url }}" alt="Byteball">'
    template: '<div><img ng-src="{{ logo_url }}" alt="Byteball"><br>Byteball</div>',
  }))
  .directive('normalizeAmount', ['utilityService', function (utilityService) {
    return {
      require: 'ngModel',
      link: (scope, element, attrs, ctrl) => {
        const normalizeAmount = function (inputValue) {
          let normalized;
          if (inputValue === undefined || inputValue === null) {
            return '';
          }

          // when amount is set by javascript (not by user action in form, set by barcode scan), element.val() returns ''
          // So that, below comparison is made
          let rawValue = element.val();
          rawValue = rawValue && rawValue !== '' ? rawValue : `${inputValue}`;

          const attrMaxLength = attrs['ng-maxlength'];
          const maxLength = attrMaxLength ? parseInt(attrMaxLength, 10) : 16;
          normalized = utilityService.normalizeAmount(rawValue).substring(0, maxLength);
          if (normalized !== inputValue) {
            if (normalized.indexOf('.') >= 0) {
              normalized = normalized.substring(0, normalized.indexOf('.') + 7);
            }
            if (normalized.charAt(normalized.length - 1) === '.') {
              normalized = normalized.substring(0, normalized.length - 2);
            }
            ctrl.$setViewValue(normalized);
            ctrl.$render();
          }
          return normalized;
        };
        ctrl.$parsers.push(normalizeAmount);
      }
    };
  }])
  .directive('ngScrollbarsFocus', ['$interval', function ($interval) {
    return {
      restrict: 'A',
      link: (scope, element) => {
        const e = window.$(element);
        const height = window.innerHeight;

        let scrollInterval = null;

        // Focus In
        e.bind('focus', () => {
          const scrollbar = e.closest('.mCustomScrollbar');

          if (!scrollbar.length) {
            return;
          }

          scrollInterval = $interval(() => {
            if (height !== window.innerHeight && scrollbar.find('.mCSB_scrollTools').length) {
              scrollbar.mCustomScrollbar('scrollTo', e);
              $interval.cancel(scrollInterval);
            }
          }, 300);
        });
        // Focus Out
        e.bind('blur', () => {
          if (scrollInterval) {
            $interval.cancel(scrollInterval);
          }
        });
      }
    };
  }])
  .directive('ngEnter', () => (scope, element, attrs) => {
      element.bind('keydown', (e) => {
        if (e.which === 13) {
          scope.$apply(() => {
            scope.$eval(attrs.ngEnter, { e });
          });
          e.preventDefault();
        }
      });
    }
  );
}());
