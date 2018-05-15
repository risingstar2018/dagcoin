angular.module('copayApp.services').factory('correspondentListService',
  ($state, $rootScope, $sce, $compile, configService, storageService,
   profileService, go, lodash, $stickyState, $deepStateRedirect, $timeout, faucetService, ENV, gettextCatalog) => {
    const eventBus = require('core/event_bus.js');
    const ValidationUtils = require('core/validation_utils.js');
    const objectHash = require('core/object_hash.js');
    const root = {};
    $rootScope.newMessagesCount = {};
    $rootScope.newMsgCounterEnabled = false;

    if (typeof nw !== 'undefined') {
      const win = nw.Window.get();
      win.on('focus', () => {
        $rootScope.newMsgCounterEnabled = false;
      });
      win.on('blur', () => {
        $rootScope.newMsgCounterEnabled = true;
      });
      $rootScope.$watch('newMessagesCount', (counters) => {
        const sum = lodash.sum(lodash.values(counters));
        if (sum) {
          win.setBadgeLabel(`${sum}`);
        } else {
          win.setBadgeLabel('');
        }
      }, true);
    }
    $rootScope.$watch('newMessagesCount', (counters) => {
      $rootScope.totalNewMsgCnt = lodash.sum(lodash.values(counters));
    }, true);

    function addIncomingMessageEvent(fromAddress, body) {
      const walletGeneral = require('core/wallet_general.js');
      let newBody = body;

      walletGeneral.readMyAddresses((arrMyAddresses) => {
        newBody = highlightActions(escapeHtml(newBody), arrMyAddresses);
        newBody = text2html(newBody);
        console.log(`body with markup: ${newBody}`);
        addMessageEvent(true, fromAddress, newBody);
      });
    }

    function addMessageEvent(bIncoming, peerAddress, body) {
      if (!root.messageEventsByCorrespondent[peerAddress]) {
        root.messageEventsByCorrespondent[peerAddress] = [];
      }
      // root.messageEventsByCorrespondent[peer_address].push({bIncoming: true, message: $sce.trustAsHtml(body)});
      if (bIncoming && !faucetService.isFaucetAddress(peerAddress)) {
        if (peerAddress in $rootScope.newMessagesCount) {
          $rootScope.newMessagesCount[peerAddress] += 1;
        } else {
          $rootScope.newMessagesCount[peerAddress] = 1;
        }
        if ($rootScope.newMessagesCount[peerAddress] === 1 && (!$state.is('correspondentDevice')
            || root.currentCorrespondent.device_address !== peerAddress)) {
          root.messageEventsByCorrespondent[peerAddress].push({
            bIncoming: false,
            message: 'new messages',
            type: 'system',
            new_message_delim: true,
          });
        }
      }
      const msgObj = {
        bIncoming,
        message: body,
        timestamp: Math.floor(Date.now() / 1000),
      };
      checkAndInsertDate(root.messageEventsByCorrespondent[peerAddress], msgObj);
      root.messageEventsByCorrespondent[peerAddress].push(msgObj);
      if ($state.is('walletHome') && $rootScope.tab === 'walletHome' && !faucetService.isFaucetAddress(peerAddress)) {
        setCurrentCorrespondent(peerAddress, () => {
          $stickyState.reset('correspondentDevice');
        });
      } else {
        $rootScope.$digest();
      }
    }

    const paymentRequestRegexp = /\[.*?\]\(Dagcoin:([0-9A-Z]{32})\?([\w=&;+%]+)\)/g; // payment description within [] is ignored

    function highlightActions(text) {
      if (text.indexOf('a ng-click="showPayment') > 0) {
        return unescapeHtml(text);
      }
      return text.replace(/\b[2-7A-Z]{32}\b(?!(\?(amount|asset|device_address)|"))/g, (address) => {
        if (!ValidationUtils.isValidAddress(address)) {
          return address;
        }
        const labelPayToThisAddress = gettextCatalog.getString('Pay to this address');
        const labelOfferAContract = gettextCatalog.getString('Offer a contract');
        return [`<a dropdown-toggle="#pop${address}">${address}</a>`,
          `<ul id="pop${address}"class="f-dropdown drop-to4p drop-4up" style="left:0px" data-dropdown-content>`,
          `<li><a ng-click="sendPayment('${address}')">${labelPayToThisAddress}</a></li>`,
          `<li><a ng-click="offerContract('${address}')">${labelOfferAContract}</a></li>`,
          '</ul>'].join('');
      }).replace(paymentRequestRegexp, (str, address, queryString) => {
        if (!ValidationUtils.isValidAddress(address)) {
          return str;
        }

        const objPaymentRequest = parsePaymentRequestQueryString(queryString);
        if (!objPaymentRequest) {
          return str;
        }
        return `<a ng-click="sendPayment('${address}', ${objPaymentRequest.amount},` +
        `'${objPaymentRequest.device_address}')">${objPaymentRequest.amountStr}</a>`;
      }).replace(/\[(.+?)\]\(command:(.+?)\)/g,
        (str, description, command) => `<a ng-click="sendCommand('${escapeQuotes(command)}',
        '${escapeQuotes(description)}')" class="command">${description}</a>`).replace(/\[(.+?)\]\(payment:(.+?)\)/g,
        (str, description, paymentJsonBase64) => {
          const arrMovements = getMovementsFromJsonBase64PaymentRequest(paymentJsonBase64, true);
          const newDescription = `Payment request: ${arrMovements.join(', ')}`;
          if (!arrMovements) {
            return '[invalid payment request]';
          }
          return `<a ng-click="sendMultiPayment('${paymentJsonBase64}')">${newDescription}</a>`;
        })
        .replace(/\bhttps?:\/\/\S+/g,
          str => `<a ng-click="openExternalLink('${escapeQuotes(str)}')" class="external-link">${str}</a>`);
    }

    function getMovementsFromJsonBase64PaymentRequest(paymentJsonBase64, bAggregatedByAsset) {
      let objMultiPaymentRequest;
      let assocPayments = 0;
      let invalidChash;
      const paymentJson = new Buffer(paymentJsonBase64, 'base64').toString('utf8');
      console.log(paymentJson);
      try {
        objMultiPaymentRequest = JSON.parse(paymentJson);
      } catch (e) {
        return null;
      }
      if (objMultiPaymentRequest.definitions) {
        Object.keys(objMultiPaymentRequest.definitions).forEach((destinationAddress) => {
          const arrDefinition = objMultiPaymentRequest.definitions[destinationAddress].definition;
          if (destinationAddress !== objectHash.getChash160(arrDefinition)) {
            invalidChash = true;
          }
        });
        if (invalidChash) {
          return null;
        }
      }
      try {
        assocPayments = getPayments(objMultiPaymentRequest);
      } catch (e) {
        return null;
      }
      let arrMovements = [];
      if (bAggregatedByAsset) {
        arrMovements.push(getAmountText(assocPayments));
      } else {
        arrMovements = objMultiPaymentRequest.payments.map(objPayment => `${getAmountText(objPayment.amount)} to ${objPayment.address}`);
      }
      return arrMovements;
    }

    function getPayments(objMultiPaymentRequest) {
      let assocPayments = 0;
      objMultiPaymentRequest.payments.forEach((objPayment) => {
        if (!ValidationUtils.isPositiveInteger(objPayment.amount)) {
          throw Error(`amount ${objPayment.amount} is not valid`);
        }
        assocPayments += objPayment.amount;
      });
      return assocPayments;
    }

    function formatOutgoingMessage(text) {
      return escapeHtmlAndInsertBr(text).replace(paymentRequestRegexp, (str, address, queryString) => {
        if (!ValidationUtils.isValidAddress(address)) {
          return str;
        }
        const objPaymentRequest = parsePaymentRequestQueryString(queryString);
        if (!objPaymentRequest) {
          return str;
        }
        return `<i>${objPaymentRequest.amountStr} ${gettextCatalog.getString('to')} ${address}</i>`;
      }).replace(/\[(.+?)\]\(payment:(.+?)\)/g, (str, description, paymentJsonBase64) => {
        const arrMovements = getMovementsFromJsonBase64PaymentRequest(paymentJsonBase64);
        if (!arrMovements) {
          return '[invalid payment request]';
        }
        return `<i>${gettextCatalog.getString('Payment request:')} ${arrMovements.join(', ')}</i>`;
      }).replace(/\bhttps?:\/\/\S+/g,
        str => `<a ng-click="openExternalLink('${escapeQuotes(str)}')" class="external-link">${str}</a>`);
    }

    function parsePaymentRequestQueryString(queryString) {
      const URI = require('core/uri.js');
      const assocParams = URI.parseQueryString(queryString, '&amp;');
      const strAmount = assocParams.amount;
      if (!strAmount) {
        return null;
      }
      const amount = parseInt(strAmount, 10);
      if (`${amount}` !== strAmount) {
        return null;
      }
      if (!ValidationUtils.isPositiveInteger(amount)) {
        return null;
      }
      const deviceAddress = assocParams.device_address || '';
      if (deviceAddress && !ValidationUtils.isValidDeviceAddress(deviceAddress)) {
        return null;
      }
      const amountStr = `Payment request: ${getAmountText(amount)}`;
      return {
        amount,
        device_address: deviceAddress,
        amountStr
      };
    }

    function text2html(text) {
      return text.replace(/\r/g, '').replace(/\n/g, '<br />').replace(/\t/g, ' &nbsp; &nbsp; ');
    }

    function escapeHtml(text) {
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function escapeHtmlAndInsertBr(text) {
      return text2html(escapeHtml(text));
    }

    function escapeQuotes(text) {
      return text.replace(/(['\\])/g, '\\$1').replace(/"/, '&quot;');
    }

    function unescapeHtml(safe) {
      return safe.replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#039;/g, "'");
    }

    function setCurrentCorrespondent(correspondentDeviceAddress, onDone) {
      if (!root.currentCorrespondent || correspondentDeviceAddress !== root.currentCorrespondent.device_address) {
        const device = require('core/device.js');
        device.readCorrespondent(correspondentDeviceAddress, (correspondent) => {
          root.currentCorrespondent = correspondent;
          onDone(true);
        });
      } else {
        onDone(false);
      }
    }

    // amount is in smallest units
    function getAmountText(amount) {
      const walletSettings = configService.getSync().wallet.settings;
      let newAmount = amount;

      const unitValue = walletSettings.unitValue;
      const unitName = walletSettings.unitName;
      newAmount /= unitValue;
      return `${newAmount} ${unitName}`;
    }

    function getHumanReadableDefinition(arrDefinition, arrMyAddresses, arrMyPubKeys, bWithLinks) {
      function parse(arrSubdefinition) {
        const op = arrSubdefinition[0];
        const args = arrSubdefinition[1];
        let arrAddresses;
        let feedName;
        let relation;
        let value;
        let minMci;
        let address;
        let str;
        switch (op) {
          case 'sig': {
            const pubkey = args.pubkey;
            return `signed by ${arrMyPubKeys.indexOf(pubkey) >= 0 ? 'you' : `public key ${pubkey}`}`;
          }
          case 'address':
            address = args;
            return `signed by ${arrMyAddresses.indexOf(address) >= 0 ? 'you' : address}`;
          case 'cosigned by':
            address = args;
            return `co-signed by ${arrMyAddresses.indexOf(address) >= 0 ? 'you' : address}`;
          case 'not':
            return `<span class="size-18">not</span>${parseAndIndent(args)}`;
          case 'or':
          case 'and':
            return args.map(parseAndIndent).join(`<span class="size-18">${op}</span>`);
          case 'r of set':
            return `at least ${args.required} of the following is true:<br />${args.set.map(parseAndIndent).join(',')}`;
          case 'weighted and':
            return `the total weight of the true conditions below is at least ${args.required}:<br />${args.set.map(arg => `${arg.weight}: ${parseAndIndent(arg.value)}`).join(',')}`;
          case 'in data feed':
            arrAddresses = args[0];
            feedName = args[1];
            relation = args[2];
            value = args[3];
            minMci = args[4];
            if (feedName === 'timestamp' && relation === '>') {
              return `after ${(typeof value === 'number') ? new Date(value).toString() : value}`;
            }
            str = `Oracle ${arrAddresses.join(', ')} posted ${feedName} ${relation} ${value}`;
            if (minMci) {
              str += ` after MCI ${minMci}`;
            }
            return str;
          case 'in merkle':
            arrAddresses = args[0];
            feedName = args[1];
            value = args[2];
            minMci = args[3];
            str = `A proof is provided that oracle ${arrAddresses.join(', ')} posted ${value} in ${feedName}`;
            if (minMci) {
              str += ` after MCI ${minMci}`;
            }
            return str;
          case 'has':
            if (args.what === 'output' && args.asset && args.amount_at_least && args.address) {
              return `sends at least ${getAmountText(args.amount_at_least)} to ${arrMyAddresses.indexOf(args.address) >= 0 ? 'you' : args.address}`;
            }
            return JSON.stringify(arrSubdefinition);
          case 'seen':
            if (args.what === 'output' && args.asset && args.amount && args.address) {
              const destAddress = ((args.address === 'this address') ? objectHash.getChash160(arrDefinition) : args.address);
              const bOwnAddress = (arrMyAddresses.indexOf(args.address) >= 0);
              const displayDestAddress = (bOwnAddress ? 'you' : args.address);
              const expectedPayment = `${getAmountText(args.amount, args.asset)} to ${displayDestAddress}`;
              return `there was a transaction that sends ${(bWithLinks && !bOwnAddress) ?
                (`<a ng-click="sendPayment('${destAddress}', ${args.amount})">${expectedPayment}</a>`)
                : expectedPayment}`;
            }
            return JSON.stringify(arrSubdefinition);

          default:
            return JSON.stringify(arrSubdefinition);
        }
      }

      function parseAndIndent(arrSubdefinition) {
        return `<div class="indent">${parse(arrSubdefinition)}</div>\n`;
      }

      return parse(arrDefinition, 0);
    }

    const historyEndForCorrespondent = {};

    function loadMoreHistory(correspondent, cb) {
      if (historyEndForCorrespondent[correspondent.device_address]) {
        if (cb) cb();
        return;
      }
      if (!root.messageEventsByCorrespondent[correspondent.device_address]) {
        root.messageEventsByCorrespondent[correspondent.device_address] = [];
      }
      const messageEvents = root.messageEventsByCorrespondent[correspondent.device_address];
      const limit = 10;
      let lastMsgTs = null;
      let lastMsgId = 90071992547411;
      if (messageEvents.length && messageEvents[0].id) {
        lastMsgTs = new Date(messageEvents[0].timestamp * 1000);
        lastMsgId = messageEvents[0].id;
      }
      const chatStorage = require('core/chat_storage.js');
      chatStorage.load(correspondent.device_address, lastMsgId, limit, (messages) => {
        Object.keys(messages).forEach((i) => {
          messages[i] = parseMessage(messages[i]);
        });
        const walletGeneral = require('core/wallet_general.js');
        walletGeneral.readMyAddresses((arrMyAddresses) => {
          if (messages.length < limit) {
            historyEndForCorrespondent[correspondent.device_address] = true;
          }
          Object.keys(messages).forEach((i) => {
            const message = messages[i];
            const msgTs = new Date(message.creation_date.replace(' ', 'T'));
            if (lastMsgTs && lastMsgTs.getDay() !== msgTs.getDay()) {
              messageEvents.unshift({
                type: 'system',
                bIncoming: false,
                message: lastMsgTs.toDateString(),
                timestamp: Math.floor(msgTs.getTime() / 1000),
              });
            }
            lastMsgTs = msgTs;
            if (message.type === 'text') {
              if (message.is_incoming) {
                message.message = highlightActions(escapeHtml(message.message), arrMyAddresses);
                message.message = text2html(message.message);
              } else {
                message.message = formatOutgoingMessage(message.message);
              }
            }
            messageEvents.unshift({
              id: message.id,
              type: message.type,
              bIncoming: message.is_incoming,
              message: message.message,
              timestamp: Math.floor(msgTs.getTime() / 1000),
              chat_recording_status: message.chat_recording_status,
            });
          });
          if (historyEndForCorrespondent[correspondent.device_address] && messageEvents.length > 1) {
            messageEvents.unshift({
              type: 'system',
              bIncoming: false,
              message: (lastMsgTs || new Date()).toDateString(),
              timestamp: Math.floor((lastMsgTs || new Date()).getTime() / 1000),
            });
          }
          $rootScope.$digest();
          if (cb) cb();
        });
      });
    }

    function checkAndInsertDate(messageEvents, message) {
      if (messageEvents.length === 0 || typeof messageEvents[messageEvents.length - 1].timestamp === 'undefined') return;

      const msgTs = new Date(message.timestamp * 1000);
      const lastMsgTs = new Date(messageEvents[messageEvents.length - 1].timestamp * 1000);
      if (lastMsgTs.getDay() !== msgTs.getDay()) {
        messageEvents.push({
          type: 'system',
          bIncoming: false,
          message: msgTs.toDateString(),
          timestamp: Math.floor(msgTs.getTime() / 1000),
        });
      }
    }

    function parseMessage(message) {
      if (message.type === 'system') {
        message.message = JSON.parse(message.message);
        message.message = `${gettextCatalog.getString('chat recording')}
             <b dropdown-toggle="#recording-drop">${message.message.state ? 'ON' : 'OFF'}</b>
             <span class="padding"></span>`;
        message.chat_recording_status = true;
      }
      return message;
    }

    function sendMessageToCorrespondentChat(correspondent, fromAddress, body) {
      return new Promise(() => {
        if (!root.messageEventsByCorrespondent[correspondent.device_address]) {
          loadMoreHistory(correspondent);
        }

        addIncomingMessageEvent(correspondent.device_address, body);

        if (correspondent.my_record_pref && correspondent.peer_record_pref) {
          const chatStorage = require('core/chat_storage.js');
          chatStorage.store(fromAddress, body, 1);
        }
      });
    }

    function readCorrespondentAndForwardMessage(fromAddress, body) {
      return new Promise((resolve) => {
        const device = require('core/device.js');
        device.readCorrespondent(fromAddress, (correspondent) => {
          resolve(correspondent);
        });
      }).then((correspondent) => {
        if (correspondent === null) {
          return Promise.reject(`CORRESPONDENT WITH ADDRESS ${fromAddress} NOT FOUND`);
        }

        return sendMessageToCorrespondentChat(correspondent, fromAddress, body);
      });
    }

    function getCorrespondentsOrderedByMessageDate() {
      const db = require('core/db');
      return new Promise((resolve, reject) => {
        try {
          db.query(`SELECT device_address, hub, name, my_record_pref, peer_record_pref, latest_message_date\n        
          FROM correspondent_devices CD\n        
          LEFT JOIN (SELECT correspondent_address, MAX(creation_date) AS latest_message_date \n        
          FROM chat_messages GROUP BY correspondent_address) CM\n        
          ON CM.correspondent_address = CD.device_address\n        
          ORDER BY latest_message_date DESC, name ASC`, [], resolve);
        } catch (e) {
          reject(`getCorrespondentsOrderedByMessageDate: ${e.message}`);
        }
      });
    }

    eventBus.on('text', (fromAddress, body) => {
      console.log(`NEW TEXT MESSAGE FROM ${fromAddress}`);
      return readCorrespondentAndForwardMessage(fromAddress, body);
    });

    eventBus.on('chat_recording_pref', (correspondentAddress, enabled) => {
      const device = require('core/device.js');
      const chatStorage = require('core/chat_storage.js');
      device.readCorrespondent(correspondentAddress, (correspondent) => {
        const oldState = (correspondent.peer_record_pref && correspondent.my_record_pref);
        correspondent.peer_record_pref = enabled;
        const newState = (correspondent.peer_record_pref && correspondent.my_record_pref);
        device.updateCorrespondentProps(correspondent);
        if (newState !== oldState) {
          if (!root.messageEventsByCorrespondent[correspondentAddress]) root.messageEventsByCorrespondent[correspondentAddress] = [];
          const message = {
            type: 'system',
            message: JSON.stringify({ state: newState }),
            timestamp: Math.floor(Date.now() / 1000),
            chat_recording_status: true,
          };
          root.messageEventsByCorrespondent[correspondentAddress].push(parseMessage(message));
          $rootScope.$digest();
          chatStorage.store(correspondentAddress, JSON.stringify({ state: newState }), 0, 'system');
        }
        if (root.currentCorrespondent && root.currentCorrespondent.device_address === correspondentAddress) {
          root.currentCorrespondent.peer_record_pref = enabled ? 1 : 0;
        }
      });
    });

    eventBus.on('sent_payment', (peerAddress, amount, asset, walletId, sendMessageToDevice, address) => {
      setCurrentCorrespondent(peerAddress, () => {
        const chatStorage = require('core/chat_storage.js');
        const device = require('core/device.js');
        const body = `<a ng-click="showPayment('${walletId}')" class="payment">Payment: ${getAmountText(amount)}</a>`;
        addMessageEvent(false, peerAddress, body);
        device.readCorrespondent(peerAddress, (correspondent) => {
          if (correspondent.my_record_pref && correspondent.peer_record_pref) chatStorage.store(peerAddress, body, 0, 'html');
        });

        if (sendMessageToDevice) {
          const deviceMessage = `<a ng-click="showPayment(null, '${address}')" class="payment">Payment: ${getAmountText(amount)}</a>`;
          device.sendMessageToDevice(peerAddress, 'text', deviceMessage);
        }

        go.path('correspondentDevice');
      });
    });

    eventBus.on('received_payment', (peerAddress, amount) => {
      const device = require('core/device.js');
      const chatStorage = require('core/chat_storage.js');
      const body = `<a ng-click="showPayment()" class="payment">Payment: ${getAmountText(amount)}</a>`;
      addMessageEvent(true, peerAddress, body);
      device.readCorrespondent(peerAddress, (correspondent) => {
        if (correspondent.my_record_pref && correspondent.peer_record_pref) chatStorage.store(peerAddress, body, 1, 'html');
      });
    });

    eventBus.on('paired', (deviceAddress) => {
      const device = require('core/device.js');
      if ($state.is('wallet.correspondentDevices')) {
        return $state.reload();
      } // refresh the list
      if (!$state.is('correspondentDevice')) {
        return null;
      }
      if (!root.currentCorrespondent) {
        return null;
      }
      if (deviceAddress !== root.currentCorrespondent.device_address) {
        return null;
      }
      // re-read the correspondent to possibly update its name
      device.readCorrespondent(deviceAddress, (correspondent) => {
        // do not assign a new object, just update its property (this object was already bound to a model)
        root.currentCorrespondent.name = correspondent.name;
        $rootScope.$digest();
      });

      return null;
    });

    eventBus.on('removed_paired_device', (deviceAddress) => {
      if ($state.is('wallet.correspondentDevices')) {
        return $state.reload();
      } // todo show popup after refreshing the list
      if (!$state.is('correspondentDevice')) {
        return null;
      }
      if (!root.currentCorrespondent) {
        return null;
      }
      if (deviceAddress !== root.currentCorrespondent.device_address) {
        return null;
      }

      // go back to list of correspondentDevices
      // todo show popup message
      // todo return to correspondentDevices when in edit-mode, too
      $deepStateRedirect.reset('wallet.correspondentDevices');
      go.path('wallet.correspondentDevices');
      $timeout(() => {
        $rootScope.$digest();
      });
      return null;
    });


    $rootScope.$on('Local/CorrespondentInvitation', (event, devicePubkey, deviceHub, pairingSecret) => {
      console.log('CorrespondentInvitation', devicePubkey, deviceHub, pairingSecret);
      root.acceptInvitation(deviceHub, devicePubkey, pairingSecret, () => {
      });
    });


    root.getPayments = getPayments;
    root.getAmountText = getAmountText;
    root.setCurrentCorrespondent = setCurrentCorrespondent;
    root.formatOutgoingMessage = formatOutgoingMessage;
    root.getHumanReadableDefinition = getHumanReadableDefinition;
    root.loadMoreHistory = loadMoreHistory;
    root.checkAndInsertDate = checkAndInsertDate;
    root.parseMessage = parseMessage;
    root.getCorrespondentsOrderedByMessageDate = getCorrespondentsOrderedByMessageDate;

    root.list = function (cb) {
      const device = require('core/device.js');
      device.readCorrespondents((arrCorrespondents) => {
        cb(null, arrCorrespondents);
      });
    };

    root.startWaitingForPairing = function (cb) {
      const device = require('core/device.js');
      device.startWaitingForPairing((pairingInfo) => {
        cb(pairingInfo);
      });
    };

    root.acceptInvitation = function (hubHost, devicePubkey, pairingSecret, cb) {
      const device = require('core/device.js');
      // return setTimeout(cb, 5000);
      if (devicePubkey === device.getMyDevicePubKey()) {
        return cb('cannot pair with myself');
      }
      // the correspondent will be initially called 'New', we'll rename it as soon as we receive the reverse pairing secret back
      device.addUnconfirmedCorrespondent(devicePubkey, hubHost, 'New', (deviceAddress) => {
        device.startWaitingForPairing((reversePairingInfo) => {
          device.sendPairingMessage(hubHost, devicePubkey, pairingSecret, reversePairingInfo.pairing_secret, {
            ifOk: cb,
            ifError: cb,
          });
        });
        // this continues in parallel
        // open chat window with the newly added correspondent
        device.readCorrespondent(deviceAddress, (correspondent) => {
          root.currentCorrespondent = correspondent;
          if (!$state.is('correspondentDevice')) {
            go.path('correspondentDevice');
          } else {
            $stickyState.reset('correspondentDevice');
            $state.reload();
          }
        });
      });

      return null;
    };

    root.currentCorrespondent = null;
    root.messageEventsByCorrespondent = {};

    return root;
  });
