/**
 * Client-side / in-browser accounts.
 */

"use strict";

var keythereum = require("keythereum");
var ROUNDS = require("../constants").ROUNDS;

keythereum.constants.pbkdf2.c = ROUNDS;
keythereum.constants.scrypt.n = ROUNDS;

module.exports = {
  getRegisterBlockNumber: require("./get-register-block-number"),
  importAccount: require("./import-account"),
  login: require("./login"),
  loginWithLedger: require("./login-with-ledger").bind(this),
  loginWithMasterKey: require("./login-with-master-key"),
  logout: require("./logout"),
  register: require("./register")
};
