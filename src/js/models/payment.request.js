/* eslint-disable no-unused-vars */

/**
 * PaymentRequest is used for send.controller initialization parameters
 * @constructor
 */
function PaymentRequest() {
  this.type = null;
  this.address = null;
  this.amount = null;
  this.asset = null;
  this.recipientDeviceAddress = null;
  this.uri = null;
  this.comment = null;
  this.isNotEmpty = function () {
    if (this.type === PaymentRequest.PAYMENT_REQUEST) {
      return this.address != null
        && this.amount != null
        && this.asset != null
        && this.recipientDeviceAddress != null;
    } else if (this.type === PaymentRequest.MERCHANT_PAYMENT_REQUEST) {
      return this.address != null
        && this.amount != null;
    } else if (this.type === PaymentRequest.URI) {
      return this.uri != null;
    }
    return false;
  };
}

PaymentRequest.PAYMENT_REQUEST = 'paymentRequest';
PaymentRequest.MERCHANT_PAYMENT_REQUEST = 'merchantPaymentRequest';
PaymentRequest.URI = 'uri';
PaymentRequest.PAYMENT_REQUEST_UNIVERSAL_LINK_REGEX = new RegExp(`^http.*/${PaymentRequest.PAYMENT_REQUEST}.*`, 'i');
PaymentRequest.DUMMY_AMOUNT_FOR_CLEARING = -1;
