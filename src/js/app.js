/* eslint-disable import/no-unresolved, no-unused-vars, no-undef */
const modules = [
  'config',
  'ui.router',
  'angularMoment',
  'mm.foundation',
  'monospaced.qrcode',
  'monospaced.elastic',
  'gettext',
  'ngLodash',
  'uiSwitch',
  'bwcModule',
  'ct.ui.router.extras',
  'ngRaven',
  'ngDialog',
  'ngAnimate',
  'swipe',
  'ksSwiper',
  'ngScrollbars',
  'dagcoin.filters',
  'dagcoin.services',
  'dagcoin.controllers',
  'dagcoin.directives',
  'dagcoin.addons'
];

const dagcoin = angular.module('dagcoin', modules);
window.dagcoin = angular.module('dagcoin', modules);

angular.module('dagcoin.filters', []);
angular.module('dagcoin.services', []);
angular.module('dagcoin.controllers', []);
angular.module('dagcoin.directives', []);
angular.module('dagcoin.addons', []);

const constants = require('byteballcore/constants.js');
const fs = require('fs');

let app = null;

if (typeof fs.readFileSync === 'function') {
  app = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
} else {
  app = { version: 'latest' };
}

// Assumes that in generated production package.json doesn't have env object
const isProduction = !constants.version.match(/t$/);

Raven
  .config('https://2b16cb28f5864d1db14e1db9cc2407ef@sentry.io/215634', {
    shouldSendCallback: () => isProduction,
    release: app.version
  })
  .addPlugin(Raven.Plugins.Angular)
  .install();

if (!isProduction) {
  Raven.uninstall();
}
