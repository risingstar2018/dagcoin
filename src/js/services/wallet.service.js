/* eslint-disable no-shadow */
(() => {
  'use strict';

  angular.module('copayApp.services').factory('walletService', WalletService);

  WalletService.$inject = ['lodash', 'ENV', 'profileService', 'correspondentListService', 'gettextCatalog', 'Device', '$rootScope'];

  /**
   * Send and receive functions are handled in this service
   * @constructor
   */
  function WalletService(lodash, ENV, profileService, correspondentListService, gettextCatalog, Device, $rootScope) {
    const root = {};
    const isCordova = Device.cordova;

    /**
     * While sending coins, callbacks defined in sendCoinRequest are invoked.
     * @param sendCoinRequest SendCoinRequest
     */
    root.sendCoin = function (sendCoinRequest) {
      const fc = profileService.focusedClient;
      const recipientDeviceAddress = sendCoinRequest.recipientDeviceAddress;
      const address = sendCoinRequest.address;
      const breadcrumbs = require('core/breadcrumbs.js');
      const asset = 'base';
      const invoiceId = sendCoinRequest.invoiceId;
      const bSendAll = sendCoinRequest.bSendAll;

      profileService.requestTouchid(null, (err) => {
        if (err) {
          sendCoinRequest.requestTouchidCb(err);
          return;
        }
        let myAddress;
        const device = require('core/device.js');
        const walletDefinedByKeys = require('core/wallet_defined_by_keys.js');
        if (sendCoinRequest.binding) {
          if (!recipientDeviceAddress) {
            throw Error(gettextCatalog.getString('recipient device address not known'));
          }
          const walletDefinedByAddresses = require('core/wallet_defined_by_addresses.js');

          // never reuse addresses as the required output could be already present
          walletDefinedByKeys.issueNextAddress(fc.credentials.walletId, 0, (addressInfo) => {
            myAddress = addressInfo.address;
            let arrDefinition;
            let assocSignersByPath;
            if (sendCoinRequest.binding.type === 'reverse_payment') {
              const arrSeenCondition = ['seen', {
                what: 'output',
                address: myAddress,
                asset: 'base',
                amount: sendCoinRequest.binding.reverseAmount,
              }];
              arrDefinition = ['or', [
                ['and', [
                  ['address', address],
                  arrSeenCondition,
                ]],
                ['and', [
                  ['address', myAddress],
                  ['not', arrSeenCondition],
                  ['in data feed', [[ENV.TIMESTAMPER_ADDRESS], 'timestamp', '>', Date.now() + Math.round(sendCoinRequest.binding.timeout * 3600 * 1000)]],
                ]],
              ]];
              assocSignersByPath = {
                'r.0.0': {
                  address,
                  member_signing_path: 'r',
                  device_address: recipientDeviceAddress,
                },
                'r.1.0': {
                  address: myAddress,
                  member_signing_path: 'r',
                  device_address: sendCoinRequest.myDeviceAddress
                },
              };
            } else {
              const arrExplicitEventCondition = ['in data feed', [[sendCoinRequest.binding.oracle_address], sendCoinRequest.binding.feed_name, '=', sendCoinRequest.binding.feed_value]];
              const arrMerkleEventCondition = ['in merkle', [[sendCoinRequest.binding.oracle_address], sendCoinRequest.binding.feed_name, sendCoinRequest.binding.feed_value]];
              let arrEventCondition;
              if (sendCoinRequest.binding.feed_type === 'explicit') {
                arrEventCondition = arrExplicitEventCondition;
              } else if (sendCoinRequest.binding.feed_type === 'merkle') {
                arrEventCondition = arrMerkleEventCondition;
              } else if (sendCoinRequest.binding.feed_type === 'either') {
                arrEventCondition = ['or', [arrMerkleEventCondition, arrExplicitEventCondition]];
              } else {
                throw Error(`unknown feed type: ${sendCoinRequest.binding.feed_type}`);
              }
              arrDefinition = ['or', [
                ['and', [['address', address], arrEventCondition]],
                ['and', [
                  ['address', myAddress], ['in data feed', [[ENV.TIMESTAMPER_ADDRESS], 'timestamp', '>', Date.now() + Math.round(sendCoinRequest.binding.timeout * 3600 * 1000)]]
                ]]
              ]];
              assocSignersByPath = {
                'r.0.0': {
                  address,
                  member_signing_path: 'r',
                  device_address: recipientDeviceAddress,
                },
                'r.1.0': {
                  address: myAddress,
                  member_signing_path: 'r',
                  device_address: sendCoinRequest.myDeviceAddress
                },
              };
              if (sendCoinRequest.binding.feed_type === 'merkle' || sendCoinRequest.binding.feed_type === 'either') {
                assocSignersByPath[(sendCoinRequest.binding.feed_type === 'merkle') ? 'r.0.1' : 'r.0.1.0'] = {
                  address: '',
                  member_signing_path: 'r',
                  device_address: recipientDeviceAddress,
                };
              }
            }
            walletDefinedByAddresses.createNewSharedAddress(arrDefinition, assocSignersByPath, {
              ifError(err) {
                sendCoinRequest.createNewSharedAddressCb(err);
              },
              ifOk(sharedAddress) {
                composeAndSend(sharedAddress);
              },
            });
          });
        } else {
          composeAndSend(address);
        }

        // compose and send
        function composeAndSend(toAddress) {
          let arrSigningDeviceAddresses = []; // empty list means that all signatures are required (such as 2-of-2)
          let opts = {};
          if (fc.credentials.m < fc.credentials.n) {
            sendCoinRequest.copayers.forEach((copayer) => {
              if (copayer.me || copayer.signs) {
                arrSigningDeviceAddresses.push(copayer.device_address);
              }
            });
          } else if (sendCoinRequest.sharedAddress) {
            arrSigningDeviceAddresses = sendCoinRequest.copayers.map(copayer => copayer.device_address);
          }

          breadcrumbs.add(`sending payment in ${asset}`);
          profileService.bKeepUnlocked = true;

          opts = {
            shared_address: sendCoinRequest.sharedAddress,
            merkleProof: sendCoinRequest.merkleProof,
            asset,
            to_address: toAddress,
            amount: sendCoinRequest.amount,
            send_all: bSendAll,
            arrSigningDeviceAddresses,
            recipientDeviceAddress,
          };

          let merchantPromise = null;

          // Merchant Payment life cycle
          if (!lodash.isEmpty(sendCoinRequest.invoiceId)) {
            merchantPromise = new Promise((resolve, reject) => {
              const merchantApiRequest = require('request');

              merchantApiRequest(`${ENV.MERCHANT_INTEGRATION_API}/${sendCoinRequest.invoiceId}`, (error, response, body) => {
                try {
                  const payload = JSON.parse(body).payload;

                  if (error) {
                    console.log(`error: ${error}`); // Print the error if one occurred
                    reject(error);
                  } else {
                    if (payload.state === 'PENDING') {
                      resolve();
                    }

                    reject(`Payment state is ${payload.state}`);
                  }
                } catch (ex) {
                  console.log(`error: ${ex}`); // Print the error if one occurred
                }
              });
            });
          } else {
            merchantPromise = Promise.resolve();
          }

          merchantPromise.then(() => {
            if (invoiceId !== null) {
              const objectHash = require('core/object_hash');
              const payload = JSON.stringify({ invoiceId });
              opts.messages = [{
                app: 'text',
                payload_location: 'inline',
                payload_hash: objectHash.getBase64Hash(payload),
                payload
              }];
            }

            console.log(`PAYMENT OPTIONS BEFORE: ${JSON.stringify(opts)}`);
            useOrIssueNextAddress(fc.credentials.walletId, 0, (addressInfo) => {
              opts.change_address = addressInfo.address;
              fc.sendMultiPayment(opts, (sendMultiPaymentError, unit /* , assocMnemonics */) => {
                let error = sendMultiPaymentError;

                sendCoinRequest.sendMultiPaymentDoneBeforeCb(sendMultiPaymentError);
                if (sendMultiPaymentError) {
                  if (sendMultiPaymentError.match(/no funded/) || sendMultiPaymentError.match(/not enough asset coins/)) {
                    error = gettextCatalog.getString('Not enough dagcoins');
                  } else if (sendMultiPaymentError.match(/connection closed/) || sendMultiPaymentError.match(/connect to light vendor failed/)) {
                    error = gettextCatalog.getString('Problems with connecting to the hub. Please try again later');
                  }
                  sendCoinRequest.sendMultiPaymentDoneErrorCb(error);
                  return;
                }
                const binding = sendCoinRequest.binding;

                if (unit != null && sendCoinRequest.invoiceId != null) {
                  // const invoiceId = sendCoinRequest.invoiceId;
                  sendCoinRequest.invoiceId = null;

                  const options = {
                    uri: `${ENV.MERCHANT_INTEGRATION_API}/payment-unit-updated`,
                    method: 'POST',
                    json: {
                      invoiceId,
                      paymentUnitId: unit
                    }
                  };

                  if (invoiceId != null) {
                    const request = require('request');
                    request(options, (error, response, body) => {
                      if (error) {
                        console.log(`PAYMENT UNIT UPDATE ERROR: ${error}`);
                      }
                      console.log(`RESPONSE: ${JSON.stringify(response)}`);
                      console.log(`BODY: ${JSON.stringify(body)}`);
                    });
                  }
                }

                sendCoinRequest.sendMultiPaymentDoneAfter(recipientDeviceAddress, toAddress, asset);
                if (recipientDeviceAddress) { // show payment in chat window
                  if (binding && binding.reverseAmount) { // create a request for reverse payment
                    if (!myAddress) {
                      throw Error(gettextCatalog.getString('my address not known'));
                    }
                    const paymentRequestCode = `dagcoin:${myAddress}?amount=${binding.reverseAmount}&asset=${encodeURIComponent(binding.reverseAsset)}`;
                    const paymentRequestText = `[reverse payment](${paymentRequestCode})`;
                    device.sendMessageToDevice(recipientDeviceAddress, 'text', paymentRequestText);
                    correspondentListService.messageEventsByCorrespondent[recipientDeviceAddress].push({
                      bIncoming: false,
                      message: correspondentListService.formatOutgoingMessage(paymentRequestText),
                      timestamp: Math.floor(Date.now() / 1000)
                    });
                    // issue next address to avoid reusing the reverse payment address
                    if (!fc.isSingleAddress) {
                      walletDefinedByKeys.issueNextAddress(fc.credentials.walletId, 0, () => { });
                    }
                  }
                }
              });
            });
            sendCoinRequest.composeAndSendDoneCb();
          }).catch((error) => {
            sendCoinRequest.composeAndSendErrorCb(error);
          });
        }

        function useOrIssueNextAddress(wallet, isChange, handleAddress) {
          if (fc.isSingleAddress) {
            handleAddress({
              address: sendCoinRequest.addr[fc.credentials.walletId]
            });
          } else {
            walletDefinedByKeys.issueNextAddress(wallet, isChange, handleAddress);
          }
        }
      });
    };

    /**
     *
     * @param state {string}
     * @return {string} Translated error message of merchant payment request state
     */
    root.getStateErrorMessageForMerchantPayment = function (state) {
      let errorMessage = '';
      switch (state) {
        case 'EXPIRED':
          errorMessage = gettextCatalog.getString('Merchant payment request expired');
          break;
        case 'CANCELLED':
          errorMessage = gettextCatalog.getString('Merchant payment request has been cancelled');
          break;
        case 'FAILED':
          errorMessage = gettextCatalog.getString('Merchant payment request failed');
          break;
        case 'WAITING_FOR_CONFIRMATION':
          errorMessage = gettextCatalog.getString('There is already a pending payment for this invoice');
          break;
        case 'PAID':
          errorMessage = gettextCatalog.getString('The invoice has already been paid');
          break;
        default:
          errorMessage = gettextCatalog.getString('An error occurred during merchant request processing');
          break;
      }
      return errorMessage;
    };


    root.checkTestnetData = () => {
      const constants = require('core/constants.js');
      if (isCordova && constants.version === '1.0') {
        const db = require('core/db.js');
        db.query('SELECT 1 FROM units WHERE version!=? LIMIT 1', [constants.version], (rows) => {
          if (rows.length > 0) {
            $rootScope.$emit('Local/ShowErrorAlert', 'Looks like you have testnet data.  Please remove the app and reinstall.', () => {
              if (navigator && navigator.app) {
                // android
                navigator.app.exitApp();
              }
              // ios doesn't exit
            });
          }
        });
      }
    };

    return root;
  }
})();
