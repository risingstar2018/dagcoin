(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('IntroCtrl', IntroCtrl);

  IntroCtrl.$inject = ['$timeout'];

  function IntroCtrl($timeout) {
    const vm = this;
    vm.swiper = {};
    vm.currentStep = 'intro';
    vm.active_index = 0;

    vm.nextSlide = () => vm.swiper.slideNext();

    vm.changeCurrentStep = (step) => {
      vm.currentStep = step;
    };

    activate();

    function activate() {
      vm.onReadySwiper = (swiper) => {
        vm.swiper = swiper;

        swiper.on('slideChangeStart', (e) => {
          $timeout(() => {
            vm.active_index = e.activeIndex;
          }, 0);
        });
      };
    }
  }
})();
