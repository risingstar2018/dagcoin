(function () {
  'use strict';

  angular.module('copayApp.controllers').controller('newVersionIsAvailable', ($scope, $modalInstance, go, newVersion,
    isCordova, isMobile) => {
    $scope.openEmailLink = function () {
      const subject = 'Transfer DAGs from old wallet';
      const toEmail = 'info@dagcoin.org';
      if (isCordova) {
        if (isMobile.Android() || isMobile.Windows()) {
          window.ignoreMobilePause = true;
        }
        window.plugins.socialsharing.shareViaEmail(
          '',
          subject,
          [toEmail], [], [] // empty recipients, CC and BCC
        );
      } else {
        go.openExternalLink(`mailto:${toEmail}?subject=${subject}`);
      }
    };

    $scope.dontShow = function () {
      newVersion.changeShowFlag(false);
      $modalInstance.close('closed result');
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  });
}());
