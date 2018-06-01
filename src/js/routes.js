/* eslint-disable import/no-extraneous-dependencies,import/no-unresolved */
(function () {
  'use strict';

  angular
    .module('copayApp')
    .config((historicLogProvider, $provide, $logProvider, $stateProvider, $urlRouterProvider, $compileProvider, ngDialogProvider) => {
      ngDialogProvider.setDefaults({
        showClose: false,
        closeByDocument: true,
        closeByEscape: true,
        closeByNavigation: true
      });

      $urlRouterProvider.otherwise('/');

      $logProvider.debugEnabled(true);
      $provide.decorator('$log', ['$delegate',
        function ($delegate) {
          const historicLog = historicLogProvider.$get();

          ['debug', 'info', 'warn', 'error', 'log'].forEach((level) => {
            const orig = $delegate[level];
            $delegate[level] = function (...argz) {
              if (level === 'error') {
                console.log(argz);
              }

              let args = [].slice.call(argz);
              if (!Array.isArray(args)) args = [args];
              args = args.map((v) => {
                let value = v;
                try {
                  if (typeof value === 'undefined') {
                    value = 'undefined';
                  }
                  if (!value) {
                    value = 'null';
                  }
                  if (typeof value === 'object') {
                    if (value.message) {
                      value = value.message;
                    } else {
                      value = JSON.stringify(value);
                    }
                  }
                  // Trim output in mobile
                  if (window.cordova) {
                    value = value.toString();
                    if (value.length > 1000) {
                      value = `${value.substr(0, 997)}...`;
                    }
                  }
                } catch (e) {
                  console.log('Error at log decorator:', e);
                  value = 'undefined';
                }
                return value;
              });
              try {
                // Send on our enhanced message to the original debug method.
                if (window.cordova) {
                  console.log(args.join(' '));
                }
                historicLog.add(level, args.join(' '), new Date());
                orig(...args);
              } catch (e) {
                console.log('ERROR (at log decorator):', e, args[0]);
              }
            };
          });
          return $delegate;
        },
      ]);

      // whitelist 'chrome-extension:' for chromeApp to work with image URLs processed by Angular
      // link: http://stackoverflow.com/questions/15606751/angular-changes-urls-to-unsafe-in-extension-page?lq=1
      $compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|ftp|file|blob|chrome-extension):|data:image\/)/);

      $stateProvider
        .state('splash', {
          url: '/splash',
          needProfile: false,
          views: {
            main: {
              templateUrl: 'controllers/initialization/splash/splash.template.html',
              controller: 'SplashCtrl as splash'
            }
          }
        })
        .state('intro', {
          url: '/intro',
          needProfile: false,
          views: {
            main: {
              templateUrl: 'controllers/initialization/intro/intro.template.html',
              controller: 'IntroCtrl as intro'
            }
          }
        })
        .state('intro_confirm', {
          url: '/intro_confirm',
          needProfile: false,
          views: {
            main: {
              templateUrl: 'controllers/initialization/confirm/confirm.template.html',
              controller: 'IntroConfirmCtrl as confirm'
            }
          }
        })
        .state('wallet', {
          url: '/',
          walletShouldBeComplete: true,
          needProfile: true,
          deepStateRedirect: true,
          sticky: true,
          views: {
            main: {
              templateUrl: 'controllers/wallet/wallet.template.html',
              controller: 'WalletCtrl as home'
            }
          }
        })
        .state('wallet.home', {
          url: '/home',
          walletShouldBeComplete: true,
          needProfile: true,
          deepStateRedirect: true,
          sticky: true,
          views: {
            tabs: {
              templateUrl: 'controllers/wallet/home/home.template.html',
              controller: 'HomeCtrl as homeCtrl'
            }
          }
        })
        .state('wallet.receive', {
          url: '/receive',
          walletShouldBeComplete: true,
          needProfile: true,
          deepStateRedirect: true,
          sticky: true,
          views: {
            tabs: {
              templateUrl: 'controllers/wallet/receive/receive.template.html',
              controller: 'ReceiveCtrl as receive'
            }
          }
        })
        .state('wallet.send', {
          url: '/send/:type/:recipientDeviceAddress/:address/:asset/:invoiceId/:publicId/:validForSeconds/:merchantName/:state/:amount/:uri',
          walletShouldBeComplete: true,
          needProfile: true,
          deepStateRedirect: true,
          sticky: true,
          views: {
            tabs: {
              templateUrl: 'controllers/wallet/send/send.template.html',
              controller: 'SendCtrl as send'
            }
          }
        })
        .state('payment', {
          url: '/uri-payment/:data',
          templateUrl: 'views/paymentUri.html',
          views: {
            main: {
              templateUrl: 'views/paymentUri.html'
            }
          },
          needProfile: true,
        })
        .state('create', {
          url: '/create',
          needProfile: true,
          views: {
            main: {
              templateUrl: 'controllers/create/create.template.html',
              controller: 'CreateCtrl as create'
            }
          }
        })
        .state('copayers', {
          url: '/copayers',
          needProfile: true,
          views: {
            main: {
              templateUrl: 'controllers/copayers/copayers.template.html',
              controller: 'CopayersCtrl as copayers'
            },
          },
        })
        .state('preferences', {
          url: '/preferences',
          walletShouldBeComplete: true,
          needProfile: true,
          views: {
            main: {
              templateUrl: 'controllers/preferences/wallet/preferencesWallet.template.html',
              controller: 'PreferencesCtrl as preferences'
            },
          },
        })
        .state('wallet.correspondentDevices', {
          url: '/correspondentDevices',
          walletShouldBeComplete: false,
          needProfile: true,
          deepStateRedirect: true,
          sticky: true,
          views: {
            tabs: {
              templateUrl: 'controllers/wallet/correspondentDevices/correspondentDevices.template.html',
              controller: 'CorrespondentDevicesCtrl as correspondentDevices'
            },
          },
        })
        .state('correspondentDevice', {
          url: '/correspondentDevice',
          params: {
            backTo: 'wallet.correspondentDevices'
          },
          walletShouldBeComplete: false,
          needProfile: true,
          views: {
            main: {
              templateUrl: 'controllers/wallet/correspondentDevices/correspondentDevice/correspondentDevice.template.html',
              controller: 'CorrespondentDeviceCtrl'
            },
          },
        })
        .state('editCorrespondentDevice', {
          url: '/editCorrespondentDevice',
          walletShouldBeComplete: false,
          needProfile: true,
          views: {
            main: {
              templateUrl: 'controllers/wallet/correspondentDevices/correspondentDevice/edit/editCorrespondentDevice.template.html',
              controller: 'EditCorrespondentDeviceCtrl as editDevice'
            },
          },
        })
        .state('addCorrespondentDevice', {
          url: '/addCorrespondentDevice',
          needProfile: true,
          views: {
            main: {
              templateUrl: 'controllers/wallet/correspondentDevices/correspondentDevice/add/addCorrespondentDevice.template.html',
            }
          }
        })
        .state('inviteCorrespondentDevice', {
          url: '/inviteCorrespondentDevice',
          walletShouldBeComplete: false,
          needProfile: true,
          views: {
            main: {
              templateUrl: 'controllers/wallet/correspondentDevices/correspondentDevice/invite/inviteCorrespondentDevice.template.html',
              controller: 'InviteCorrespondentDeviceCtrl as inviteDevice'
            }
          }
        })
        .state('acceptCorrespondentInvitation', {
          url: '/acceptCorrespondentInvitation',
          walletShouldBeComplete: false,
          needProfile: true,
          views: {
            main: {
              templateUrl: 'controllers/wallet/correspondentDevices/correspondentDevice/accept/acceptInvitation.template.html',
              controller: 'AcceptCorrespondentInvitationCtrl as acceptInvitation'
            },
          },
        })
        .state('authConfirmation', {
          url: '/authConfirmation',
          walletShouldBeComplete: true,
          needProfile: true,
          views: {
            main: {
              templateUrl: 'controllers/authConfirmation/authConfirmation.template.html',
              controller: ''
            },
          },
        })
        .state('preferencesDeviceName', {
          url: '/preferencesDeviceName',
          walletShouldBeComplete: false,
          needProfile: false,
          views: {
            main: {
              templateUrl: 'controllers/preferences/global/device/name/preferencesDeviceName.template.html',
              controller: 'PreferencesDeviceNameCtrl as prefDeviceName'
            },
          },
        })
        .state('preferencesLanguage', {
          url: '/preferencesLanguage',
          walletShouldBeComplete: true,
          needProfile: true,
          views: {
            main: {
              templateUrl: 'controllers/preferences/global/language/preferencesLanguage.html',
              controller: 'preferencesLanguageController as prefLang'
            },
          },
        })
        .state('preferencesHubSettings', {
          url: '/preferencesHubSettings',
          walletShouldBeComplete: false,
          needProfile: false,
          views: {
            main: {
              templateUrl: 'controllers/preferences/global/hub/preferencesHubSettings.template.html',
              controller: 'PreferencesHubSettingsCtrl as prefHubSettings'
            },
          },
        })
        .state('preferencesAdvanced', {
          url: '/preferencesAdvanced',
          walletShouldBeComplete: true,
          needProfile: true,
          views: {
            main: {
              templateUrl: 'controllers/preferences/wallet/advanced/preferencesAdvanced.template.html',
            }
          },
        })
        .state('preferencesDeleteWallet', {
          url: '/delete',
          walletShouldBeComplete: true,
          needProfile: true,
          views: {
            'main@': {
              templateUrl: 'controllers/preferences/wallet/delete/preferencesDeleteWallet.template.html',
              controller: 'PreferencesDeleteWalletCtrl as preferences'
            },
          }
        })
        .state('preferencesAlias', {
          url: '/preferencesAlias',
          walletShouldBeComplete: true,
          needProfile: true,
          views: {
            main: {
              templateUrl: 'controllers/preferences/wallet/alias/preferencesAlias.template.html',
              controller: 'PreferencesAliasCtrl as prefAlias'
            },

          },
        })
        .state('information', {
          url: '/information',
          walletShouldBeComplete: true,
          needProfile: true,
          views: {
            main: {
              templateUrl: 'controllers/preferences/wallet/information/preferencesInformation.template.html',
              controller: 'PreferencesInformationCtrl as info'
            },
          },
        })
        .state('system', {
          url: '/system',
          walletShouldBeComplete: true,
          needProfile: true,
          views: {
            main: {
              templateUrl: 'controllers/preferences/global/system/preferencesSystem.template.html',
              controller: 'PreferencesSystemCtrl as system'
            },
          },
        })
        .state('security', {
          url: '/security',
          walletShouldBeComplete: true,
          needProfile: true,
          views: {
            main: {
              templateUrl: 'controllers/preferences/global/security/preferencesSecurity.template.html',
              controller: 'PreferencesSecurityCtrl as security'
            },
          },
        })
        .state('notifications', {
          url: '/notifications',
          walletShouldBeComplete: true,
          needProfile: true,
          views: {
            main: {
              templateUrl: 'controllers/preferences/global/notifications/preferencesNotifications.template.html',
              controller: 'PreferencesNotificationsCtrl as notifications'
            },
          },
        })
        .state('about', {
          url: '/about',
          walletShouldBeComplete: true,
          needProfile: true,
          views: {
            main: {
              templateUrl: 'controllers/preferences/global/about/preferencesAbout.template.html',
              controller: 'PreferencesAboutCtrl as about'
            },
          },
        })
        .state('aboutDevice', {
          url: '/aboutDevice',
          walletShouldBeComplete: true,
          needProfile: true,
          views: {
            main: {
              templateUrl: 'controllers/preferences/global/device/about/preferencesAboutDevice.template.html',
              controller: 'PreferencesAboutDeviceCtrl as aboutDevice'
            },
          },
        })
        .state('logs', {
          url: '/logs',
          templateUrl: 'views/preferencesLogs.html',
          walletShouldBeComplete: true,
          needProfile: true,
          views: {
            main: {
              templateUrl: 'controllers/preferences/global/log/preferencesLogs.template.html',
              controller: 'PreferencesLogsCtrl as logs'
            }
          }
        })
        .state('backup', {
          url: '/backup',
          params: {
            backTo: 'security'
          },
          walletShouldBeComplete: true,
          needProfile: true,
          views: {
            main: {
              templateUrl: 'controllers/preferences/global/security/backup/backup.template.html',
              controller: 'BackupCtrl as backup'
            }
          }
        })
        .state('backupGlobal', {
          url: '/backup',
          params: {
            backTo: 'preferencesGlobal'
          },
          templateUrl: 'views/backup.html',
          walletShouldBeComplete: true,
          needProfile: true,
          views: {
            main: {
              templateUrl: 'views/backup.html',
            },
          },
        })
        .state('recovery', {
          url: '/recovery',
          params: {
            backTo: 'security'
          },
          walletShouldBeComplete: true,
          needProfile: true,
          views: {
            main: {
              templateUrl: 'controllers/preferences/global/security/recovery/recovery.template.html',
              controller: 'RecoveryCtrl as recovery'
            }
          }
        })
        .state('initialRecovery', {
          url: '/initialRecovery',
          walletShouldBeComplete: false,
          needProfile: false,
          views: {
            main: {
              templateUrl: 'controllers/preferences/global/security/recovery/recovery.template.html',
              controller: 'RecoveryCtrl as recovery'
            }
          }
        })
        .state('preferencesGlobal', {
          url: '/preferencesGlobal',
          needProfile: true,
          views: {
            main: {
              templateUrl: 'controllers/preferences/global/preferencesGlobal.template.html'
            }
          }
        })
        .state('transactions', {
          url: '/transactions',
          params: {
            backTo: 'walletHome',
            address: null
          },
          needProfile: true,
          views: {
            main: {
              templateUrl: 'controllers/transactions/transactions.template.html'
            },
          }
        })
        .state('transaction', {
          url: '/transactions/:address',
          params: {
            backTo: 'walletHome',
            address: null
          },
          needProfile: true,
          views: {
            main: {
              templateUrl: 'controllers/transactions/transactions.template.html'
            },
          }
        })
        .state('contacts', {
          url: '/contacts',
          needProfile: true,
          views: {
            main: {
              templateUrl: 'controllers/contacts/contacts.template.html',
              controller: 'ContactsController as contacts'
            },
          }
        })
        .state('new_contact', {
          url: '/contacts/new',
          params: {
            backTo: 'contacts'
          },
          needProfile: true,
          views: {
            main: {
              templateUrl: 'controllers/contacts/contact/new/newContact.template.html',
              controller: 'NewContactController as contact'
            }
          }
        })
        .state('contact', {
          url: '/contacts/:address',
          params: {
            backTo: 'contacts'
          },
          needProfile: true,
          views: {
            main: {
              templateUrl: 'controllers/contacts/contact/contact.template.html',
              controller: 'ContactController as contact',
            }
          }
        })

        .state('edit_contact', {
          url: '/contact/:address/edit',
          params: {
            backTo: 'contact'
          },
          needProfile: true,
          views: {
            main: {
              templateUrl: 'controllers/contacts/contact/edit/editContact.template.html',
              controller: 'EditContactController as contact'
            },
          }
        })
        .state('warning', {
          url: '/warning',
          controller: 'warningController',
          templateUrl: 'views/warning.html',
          needProfile: false,
        })
        .state('cordova', { // never used
          url: '/cordova/:status/:isHome',
          views: {
            main: {
              controller($rootScope, $state, $stateParams, $timeout, go, isCordova) {
                console.log(`cordova status: ${$stateParams.status}`);
                switch ($stateParams.status) {
                  case 'resume':
                    $rootScope.$emit('Local/Resume');
                    break;
                  case 'backbutton':
                    if (isCordova && $stateParams.isHome === 'true' && !$rootScope.modalOpened) {
                      navigator.app.exitApp();
                    } else {
                      $rootScope.$emit('closeModal');
                    }
                    break;
                  default:
                  // Error handler should be here
                }
              },
            },
          },
          needProfile: false,
        });
    })
    .run(($rootScope, $state, $stateParams, $log, uriHandler, Device, profileService, configService, $timeout, nodeWebkit, uxLanguage, animationService, backButton, go) => {
      const isCordova = Device.cordova;
      if ('addEventListener' in document) {
        document.addEventListener('DOMContentLoaded', () => {
          FastClick.attach(document.body);
        }, false);
      }

      uxLanguage.init();

      // Register URI handler, not for mobileApp
      if (!isCordova) {
        uriHandler.register();
      }

      if (nodeWebkit.isDefined()) {
        const gui = require('nw.gui');
        const win = gui.Window.get();
        win.setResizable(false);
        const os = require('os');
        const platform = os.platform();

        if (platform.indexOf('win') === -1) {
          const nativeMenuBar = new gui.Menu({
            type: 'menubar',
          });
          try {
            nativeMenuBar.createMacBuiltin('DAGCOIN');
          } catch (e) {
            $log.debug('This is not OSX');
          }
          win.menu = nativeMenuBar;
        }
      }
      if (isCordova) {
        document.addEventListener('resume', () => {
          $timeout(() => {
            configService.get((config) => {
              // password and finger print options are read from config and profile service
              const needPassword = !!profileService.profile.xPrivKeyEncrypted;
              const needFingerprint = !!config.touchId;
              if (needPassword) {
                profileService.insistUnlockFC(null, (err) => {
                  if (!err) {
                    $rootScope.$emit('Local/ProfileBound');
                  }
                });
              } else if (needFingerprint) {
                profileService.insistUnlockWithFingerprintFC((err) => {
                  if (!err) {
                    $rootScope.$emit('Local/ProfileBound');
                  }
                });
              }
            });
          }, 100);
        }, false);
      }

      $rootScope.$on('$stateChangeStart', (event, toState, toParams) => {
        backButton.menuOpened = false;
        go.swipe();
        if (!profileService.profile && toState.needProfile) {
          // Give us time to open / create the profile
          event.preventDefault();

          // Try to open local profile
          profileService.loadAndBindProfile((err) => {
            if (err) {
              if (err.message && err.message.match('NOPROFILE')) {
                $log.debug('No profile... redirecting');
                $state.go('splash');
              } else if (err.message && err.message.match('NONAGREEDDISCLAIMER')) {
                $log.debug('Display disclaimer... redirecting');
                $state.go('intro');
              } else {
                throw new Error(err); // TODO
              }
            } else {
              $log.debug('Profile loaded ... Starting UX.');
              $state.transitionTo(toState.name || toState, toParams);
            }
          });
        }

        if (
          profileService.focusedClient && !profileService.focusedClient.isComplete() &&
          toState.walletShouldBeComplete
        ) {
          $state.transitionTo('copayers');
          event.preventDefault();
        }
      });
    });
}());
