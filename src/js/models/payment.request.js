/* eslint-disable no-unused-vars */

function PaymentRequest() {
  this.type = null;
  this.address = null;
  this.amount = null;
  this.asset = null;
  this.recipientDeviceAddress = null;
  this.uri = null;
  this.comment = null; // TODO sinan how this is used? This must be added to routes.js path variable later
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
