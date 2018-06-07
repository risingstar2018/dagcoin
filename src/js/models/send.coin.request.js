/* eslint-disable no-unused-vars */
/**
 * This class holds the information that are needed to send coin.
 * And some callback methods. SendCoinRequestBuilder class had better to be used to create instance.
 *
 */
function SendCoinRequest() {
  this.binding = {};
  this.recipientDeviceAddress = null;
  this.myDeviceAddress = null;
  this.sharedAddress = null;
  this.copayers = null;
  this.invoiceId = null;
  this.publicId = null;
  this.address = null;
  this.merkleProof = null;
  this.amount = null;
  this.bSendAll = null;
  this.addr = {};
  this.requestTouchidCb = () => { };
  this.createNewSharedAddressCb = () => { };
  this.sendMultiPaymentDoneBeforeCb = () => { };
  this.sendMultiPaymentDoneErrorCb = () => { };
  this.sendMultiPaymentDoneAfter = () => { };
  this.composeAndSendDoneCb = () => { };
  this.composeAndSendErrorCb = () => { };
}

/**
 *
 * @constructor
 */
function SendCoinRequestBuilder() {
  this.request = new SendCoinRequest();
  this.binding = function (binding) {
    this.request.binding = binding;
    return this;
  };
  this.recipientDeviceAddress = function (recipientDeviceAddress) {
    this.request.recipientDeviceAddress = recipientDeviceAddress;
    return this;
  };
  this.myDeviceAddress = function (myDeviceAddress) {
    this.request.myDeviceAddress = myDeviceAddress;
    return this;
  };
  this.sharedAddress = function (sharedAddress) {
    this.request.sharedAddress = sharedAddress;
    return this;
  };
  this.copayers = function (copayers) {
    this.request.copayers = copayers;
    return this;
  };
  this.invoiceId = function (invoiceId) {
    this.request.invoiceId = invoiceId;
    return this;
  };
  this.publicId = function (publicId) {
    this.request.publicId = publicId;
    return this;
  };
  this.address = function (address) {
    this.request.address = address;
    return this;
  };
  this.merkleProof = function (merkleProof) {
    this.request.merkleProof = merkleProof;
    return this;
  };
  this.amount = function (amount) {
    this.request.amount = amount;
    return this;
  };
  this.bSendAll = function (bSendAll) {
    this.request.bSendAll = bSendAll;
    return this;
  };
  this.addr = function (addr) {
    this.request.addr = addr;
    return this;
  };
  this.requestTouchidCb = function (cb) {
    this.request.requestTouchidCb = cb;
    return this;
  };
  this.createNewSharedAddressCb = function (cb) {
    this.request.createNewSharedAddressCb = cb;
    return this;
  };
  this.sendMultiPaymentDoneBeforeCb = function (cb) {
    this.request.sendMultiPaymentDoneBeforeCb = cb;
    return this;
  };
  this.sendMultiPaymentDoneErrorCb = function (cb) {
    this.request.sendMultiPaymentDoneErrorCb = cb;
    return this;
  };
  this.sendMultiPaymentDoneAfter = function (cb) {
    this.request.sendMultiPaymentDoneAfter = cb;
    return this;
  };
  this.composeAndSendDoneCb = function (cb) {
    this.request.composeAndSendDoneCb = cb;
    return this;
  };
  this.composeAndSendErrorCb = function (cb) {
    this.request.composeAndSendErrorCb = cb;
    return this;
  };
  this.build = function () {
    return this.request;
  };
}

