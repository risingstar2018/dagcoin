(function () {
  'use strict';

  /* eslint-disable import/no-unresolved,import/no-extraneous-dependencies */
  angular.module('copayApp.services').factory('nodeWebkit', () => {
    const root = {};

    root.isDefined = function () {
      return isNodeWebkit();
    };

    root.readFromClipboard = function () {
      if (!isNodeWebkit()) {
        return;
      }
      const clipboard = getClipBoard();
      clipboard.get();
    };

    root.writeToClipboard = function (text) {
      if (!isNodeWebkit()) {
        return;
      }
      const clipboard = getClipBoard();
      clipboard.set(text);
    };

    root.openExternalLink = function (url) {
      if (!isNodeWebkit()) {
        return;
      }
      const gui = require('nw.gui');
      gui.Shell.openExternal(url);
    };

    function getClipBoard() {
      const gui = require('nw.gui');
      return gui.Clipboard.get();
    }

    function isNodeWebkit() {
      const isNode = (typeof process !== 'undefined' && typeof require !== 'undefined');
      if (!isNode) {
        return false;
      }
      try {
        return (typeof require('nw.gui') !== 'undefined');
      } catch (e) {
        return false;
      }
    }

    return root;
  });
}());
