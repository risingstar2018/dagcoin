(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('IntroController', IntroController);

  IntroController.$inject = ['$scope', '$timeout'];

  function IntroController($scope, $timeout) {
    $scope.swiper = {};
    $scope.currentStep = 'intro';
    $scope.active_index = 0;

    $scope.nextSlide = () => {
      $scope.swiper.slideNext();
    };

    $scope.changeCurrentStep = (step) => {
      $scope.currentStep = step;
    };

    activate();

    function activate() {
      $scope.onReadySwiper = (swiper) => {
        $scope.swiper = swiper;

        swiper.on('slideChangeStart', (e) => {
          $timeout(() => {
            $scope.active_index = e.activeIndex;
          }, 0);
        });
      };
    }
  }
})();
