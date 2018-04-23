/* eslint-disable import/no-extraneous-dependencies,import/no-unresolved,no-undef */
(function () {
  'use strict';

  angular.module('copayApp.services').factory('go', ($window, $rootScope, $location, $state, profileService, nodeWebkit,
                                                     notification, gettextCatalog, authService, $deepStateRedirect,
                                                     $stickyState, ENV, configService, $modalStack) => {
    const root = {};
      let removeListener;
      const hideSidebars = function () {
        if (typeof document === 'undefined') {
          return;
        }
        const elem = document.getElementById('off-canvas-wrap');
        elem.className = 'off-canvas-wrap';
      };

      const toggleSidebar = function (invert) {
        if (typeof document === 'undefined') {
          return;
        }

        const elem = document.getElementById('off-canvas-wrap');
        const leftbarActive = elem.className.indexOf('move-right') >= 0;

        if (invert) {
          if (profileService.profile && !$rootScope.hideNavigation) {
            elem.className = 'off-canvas-wrap move-right';
          }
        } else if (leftbarActive) {
          hideSidebars();
        }
      };

      root.openExternalLink = function (url, target) {
        if (nodeWebkit.isDefined()) {
          nodeWebkit.openExternalLink(url);
        } else {
          const targetElement = target || '_blank';
          window.open(url, targetElement, 'location=no');
        }
      };

      root.path = function (path, cb) {
        $state.transitionTo(path)
        .then(() => {
          console.log(`transition done ${path}`);
          if (cb) {
            return cb();
          }
        }, (err) => {
          console.log(`transition failed ${path}, err: ${err}`);
          if (cb) {
            return cb('animation in progress');
          }
        });
        hideSidebars();
      };

      root.swipe = function (invert) {
        toggleSidebar(invert);
      };

      root.walletHome = function () {
        const fc = profileService.focusedClient;
        if (fc && !fc.isComplete()) {
          root.path('copayers');
        } else {
          root.path('wallet', () => {
            $rootScope.$emit('Local/SetTab', 'wallet.home');
          });
        }
      };

      root.send = function (cb) {
        $stickyState.reset('wallet');
        root.path('wallet', () => {
          $rootScope.$emit('Local/SetTab', 'wallet.send');
          if (cb) {
            cb();
          }
        });
      };

    /**
     * This redirect works in case window.initialTab is not empty and there is any tab to redirect.
     * Otherwise no effect.
     */
    root.redirectToTabIfNeeded = function () {
      if (window.initialTab) {
        if (window.initialTab.tab === 'wallet.send') {
          $modalStack.dismissAll();
          const address = window.initialTab.payload.address;
          const walletSettings = configService.getSync().wallet.settings;
          const unitValue = walletSettings.unitValue;
          let amount = window.initialTab.payload.amount;
          amount *= unitValue;
          $rootScope.$emit('paymentRequest', address, amount, 'base', null);
        }
        delete window.initialTab;
      }
    };

      root.preferences = function () {
        $state.go('preferences');
      };

      root.preferencesGlobal = function () {
        $state.go('preferencesGlobal');
      };

      root.receive = function () {
        $state.go('wallet.receive');
      };

      root.reload = function () {
        $state.reload();
      };

      // Global go. This should be in a better place TODO
      // We dont do a 'go' directive, to use the benefits of ng-touch with ng-click
      $rootScope.go = function (path, resetState) {
        if (resetState) $deepStateRedirect.reset(resetState);
        root.path(path);
      };

      $rootScope.openExternalLink = function (url, target) {
        root.openExternalLink(url, target);
      };

      function handleUri(uri) {
        console.log(`handleUri ${uri}`);
        if (uri.match(PaymentRequest.PAYMENT_REQUEST_UNIVERSAL_LINK_REGEX)) {
          console.log('URI is an http(s) paymentRequest. handleUri is ignoring.');
          return;
        }

        processMerchantPaymentRequestQrCode(uri).then((wasMerchantPayment) => {
          if (!wasMerchantPayment) {
            processGenericPaymentRequestQrCode(uri);
          }
        });
      }

      function processMerchantPaymentRequestQrCode(uri) {
        console.log('PROCESSING AS MERCANT PAYMENT REQUEST QR');

        if (uri == null || uri.indexOf(':') < 0) {
          console.log('URI DOESN\'T LOOK LIKE A MERCHANT PAYMENT REQUEST AT ALL');
          return Promise.resolve(false);
        }

        const invoiceId = uri.split(':')[1];
        const uuidV4Regex = /^[A-F\d]{8}-[A-F\d]{4}-4[A-F\d]{3}-[89AB][A-F\d]{3}-[A-F\d]{12}$/i;

        if (!uuidV4Regex.test(invoiceId)) {
          console.log('THE URI CONTENT IS NOT A UUID V4');
          return Promise.resolve(false);
        }

        const request = require('request');

        return new Promise((resolve) => {
          request(`${ENV.MERCHANT_INTEGRATION_API}/${invoiceId}`, (error, response, body) => {
            try {
              const payload = JSON.parse(body).payload;

              if (error) {
                console.log(`error: ${error}`); // Print the error if one occurred
              }
              console.log(`body: ${body}`);

              $rootScope.$emit(
                'merchantPaymentRequest',
                payload.walletAddress,
                payload.coinAmount * 1000 * 1000,
                payload.id,
                payload.validForSeconds,
                payload.merchantName,
                payload.state
              );
            } catch (ex) {
              console.log(`error: ${ex}`); // Print the error if one occurred
            }

            resolve(true);
          });
        });
      }

      function processGenericPaymentRequestQrCode(uri) {
        require('core/uri.js').parseUri(uri, {
          ifError(err) {
            console.log(err);
            const conf = require('core/conf.js');
            const noPrefixRegex = new RegExp(`.*no.*${conf.program}.*prefix.*`, 'i');
            if (noPrefixRegex.test(err.toString())) {
              notification.error(gettextCatalog.getString('Incorrect Dagcoin Address'));
            } else {
              notification.error(err);
            }

            // notification.success(gettextCatalog.getString('Success'), err);
          },
          ifOk(objRequest) {
            console.log(`request: ${JSON.stringify(objRequest)}`);
            if (objRequest.type === 'address') {
              root.send(() => {
                $rootScope.$emit('paymentRequest', objRequest.address, objRequest.amount, objRequest.asset);
              });
            } else if (objRequest.type === 'pairing') {
              $rootScope.$emit('Local/CorrespondentInvitation', objRequest.pubkey, objRequest.hub, objRequest.pairing_secret);
            } else if (objRequest.type === 'auth') {
              authService.objRequest = objRequest;
              root.path('authConfirmation');
            } else {
              throw Error(`unknown url type: ${objRequest.type}`);
            }
          },
        });
      }

      function extractByteballArgFromCommandLine(commandLine) {
        const conf = require('core/conf.js');
        const re = new RegExp(`^${conf.program}:`, 'i');
        const arrParts = commandLine.split(' '); // on windows includes exe and all args, on mac just our arg
        for (let i = 0; i < arrParts.length; i += 1) {
          const part = arrParts[i].trim();
          if (part.match(re)) {
            return part;
          }
        }
        return null;
      }

      function registerWindowsProtocolHandler() {
        // now we do it in inno setup
      }

      function createLinuxDesktopFile() {
        console.log('will write .desktop file');
        const fs = require('fs');
        const path = require('path');
        const childProcess = require('child_process');
        const pack = require('../package.json'); // relative to html root
        const applicationsDir = `${process.env.HOME}/.local/share/applications`;
        fs.mkdir(applicationsDir, 0o700, (err) => {
          console.log(`mkdir applications: ${err}`);
          fs.writeFile(`${applicationsDir}/${pack.name}.desktop`, `[Desktop Entry]\n\
            Type=Application\n\
            Version=1.0\n\
            Name=${pack.name}\n\
            Comment=${pack.description}\n\
            Exec=${process.execPath.replace(/ /g, '\\ ')} %u\n\
            Icon=${path.dirname(process.execPath)}/public/img/icons/icon-white-outline.iconset/icon_256x256.png\n\
            Terminal=false\n\
            Categories=Office;Finance;\n\
            MimeType=x-scheme-handler/${pack.name};\n\
            X-Ubuntu-Touch=true\n\
            X-Ubuntu-StageHint=SideStage\n`, { mode: '0755' }, (error) => {
              if (error) {
                throw Error(`failed to write desktop file: ${error}`);
              }
              childProcess.exec('update-desktop-database ~/.local/share/applications', (childProcessError) => {
                if (childProcessError) {
                  throw Error(`failed to exec update-desktop-database: ${childProcessError}`);
                }
                console.log('.desktop done');
              });
            });
        });
      }

      let gui;
      try {
        gui = require('nw.gui');
      } catch (e) {
        // continue regardless of error
      }

      if (gui) { // nwjs
        const removeListenerForOnopen = $rootScope.$on('Local/BalanceUpdatedAndWalletUnlocked', () => {
          removeListenerForOnopen();
          gui.App.on('open', (commandLine) => {
            console.log(`Open url: ${commandLine}`);
            if (commandLine) {
              const file = extractByteballArgFromCommandLine(commandLine);
              if (!file) {
                return console.log('no byteball: arg found');
              }
              handleUri(file);
              gui.Window.get().focus();
            }
          });
        });
        console.log(`argv: ${gui.App.argv}`);
        if (gui.App.argv[0]) {
          // wait till the wallet fully loads
          removeListener = $rootScope.$on('Local/BalanceUpdatedAndWalletUnlocked', () => {
            setTimeout(() => {
              handleUri(gui.App.argv[0]);
            }, 100);
            removeListener();
          });
        }
        if (process.platform === 'win32' || process.platform === 'linux') {
          // wait till the wallet fully loads
          const removeRegListener = $rootScope.$on('Local/BalanceUpdated', () => {
            setTimeout(() => {
              if (process.platform === 'win32') {
                registerWindowsProtocolHandler();
              } else {
                createLinuxDesktopFile();
              }
              gui.desktop = `${process.env.HOME}/.local/share/applications`;
            }, 200);
            removeRegListener();
          });
        }
        /* var win = gui.Window.get();
         win.on('close', function(){
         console.log('close event');
         var db = require('core/db.js');
         db.close(function(err){
         console.log('close err: '+err);
         });
         this.close(true);
         }); */
      } else if (window.cordova) {
        // console.log("go service: setting temp handleOpenURL");
        // window.handleOpenURL = tempHandleUri;
        // wait till the wallet fully loads
        removeListener = $rootScope.$on('Local/BalanceUpdatedAndWalletUnlocked', () => {
          console.log('setting permanent handleOpenURL');
          window.handleOpenURL = handleUri;
          if (window.open_url) { // use cached url at startup
            console.log(`using cached open url ${window.open_url}`);
            setTimeout(() => {
              handleUri(window.open_url);
            }, 100);
          }
          removeListener();
        });
        /*
         document.addEventListener('backbutton', function() {
         console.log('doc backbutton');
         if (root.onBackButton)
         root.onBackButton();
         }); */
        document.addEventListener('resume', () => {
          console.log('resume');
          $rootScope.$emit('Local/Resume');
        }, false);
      }

      root.handleUri = handleUri;

      return root;
    }).factory('$exceptionHandler', ($log) => {
      const eventBus = require('core/event_bus.js');
      const exHandler = (exception, cause) => {
        console.log('angular $exceptionHandler');
        $log.error(exception, cause);
        eventBus.emit('uncaught_error', `An e xception occurred: ${exception}; cause: ${cause}`, exception);
      };
      return exHandler;
    });

  function tempHandleUri(url) {
    console.log(`saving open url ${url}`);
    window.open_url = url;
  }

  console.log('parsing go.js');
  if (window.cordova) {
    // this is temporary, before angular starts
    console.log('go file: setting temp handleOpenURL');
    window.handleOpenURL = tempHandleUri;
  }

  window.onerror = function (msg, url, line, col, error) {
    const eventBus = require('core/event_bus.js');
    console.log(`Javascript error: ${msg}`, error);
    eventBus.emit('uncaught_error', `Javascript error: ${msg}`, error);
  };

  process.on('uncaughtException', (e) => {
    if (e.stack) {
      console.error('uncaughtException: ', e.stack);
    } else {
      console.error('uncaughtException: ', e);
    }
    eventBus.emit('uncaught_error', `Uncaught exception: ${e}`, e);
  });
}());
