(function () {
  'use strict';

  angular.module('copayApp.services')
  .factory('navigationService', (
    configService,
    profileService,
    $state,
    gettextCatalog,
    $q
  ) => {
    const root = {};

    function requestPassword(error) {
      const def = $q.defer();

      profileService.unlockFC(error, (err) => {
        if (err) {
          if (err.message !== gettextCatalog.getString('Password needed')) {
            return requestPassword(err.message).then((locked) => {
              def.resolve(locked);
            });
          }

          def.resolve(true);
          return;
        }

        def.resolve(false);
      });

      return def.promise;
    }

    root.navigateSecure = function (state) {
      const config = configService.getSync();

      const needPassword = profileService.profile && profileService.profile.xPrivKeyEncrypted && !!profileService.profile.xPrivKeyEncrypted;
      const needFingerprint = !!config.touchId;
      const needAuth = needPassword || needFingerprint;

      if (!needAuth) {
        $state.go(state);
        return;
      }

      if (needPassword) {
        requestPassword().then((locked) => {
          if (!locked) {
            $state.go(state);
          }
        });
      }

      if (needFingerprint) {
        profileService.requestTouchid('unlockingApp', (err) => {
          if (!err) {
            $state.go(state);
          }
        });
      }
    };

    return root;
  });
}());
