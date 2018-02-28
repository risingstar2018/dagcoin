(() => {
  'use strict';

  angular
    .module('copayApp.controllers')
    .controller('RemoveContactModalCtrl', RemoveContactModalCtrl);

  RemoveContactModalCtrl.$inject = ['$scope', '$stateParams', 'addressbookService', '$state'];

  function RemoveContactModalCtrl($scope, $stateParams, addressbookService, $state) {
    const address = $stateParams.address;

    $scope.contact = { address };

    $scope.removeContact = () => {
      addressbookService.remove($stateParams.address, () => {
        $state.go('contacts');
      });
    };
  }
})();
