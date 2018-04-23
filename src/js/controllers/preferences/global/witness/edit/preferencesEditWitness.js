(function () {
  'use strict';

  angular.module('copayApp.controllers').controller('preferencesEditWitnessController',
    function ($scope, $timeout, go, witnessListService) {
      const self = this;
      this.witness = witnessListService.currentWitness;

      this.save = function () {
        const newAddress = this.witness.trim();
        if (newAddress === witnessListService.currentWitness) {
          return goBack();
        }
        const myWitnesses = require('core/my_witnesses.js');
        myWitnesses.replaceWitness(witnessListService.currentWitness, newAddress, (err) => {
          console.log(err);
          if (err) {
            return setError(err);
          }
          goBack();
        });
      };

      function setError(error) {
        self.error = error;
        $timeout(() => {
          $scope.$apply();
        }, 100);
      }

      function goBack() {
        go.path('witnesses');
      }
    });
}());
