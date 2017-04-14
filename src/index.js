/**
 * Augur JavaScript SDK
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var NODE_JS = (typeof module !== "undefined") && process && !process.browser;

var BigNumber = require("bignumber.js");
var LedgerEthereum = require("ethereumjs-ledger").LedgerEthereum;
var LedgerEthereumNetwork = require("ethereumjs-ledger").Network;
var LedgerBrowserConnectionFactory = require("ethereumjs-ledger").BrowserLedgerConnectionFactory;
var pify = require("pify");

var modules = [
  require("./modules/connect"),
  require("./modules/transact"),
  require("./modules/cash"),
  require("./modules/events"),
  require("./modules/markets"),
  require("./modules/buyAndSellShares"),
  require("./modules/trade"),
  require("./modules/createBranch"),
  require("./modules/sendReputation"),
  require("./modules/makeReports"),
  require("./modules/collectFees"),
  require("./modules/createMarket"),
  require("./modules/compositeGetters"),
  require("./modules/slashRep"),
  require("./modules/logs"),
  require("./modules/abacus"),
  require("./modules/reporting"),
  require("./modules/payout"),
  require("./modules/placeTrade"),
  require("./modules/tradingActions"),
  require("./modules/makeOrder"),
  require("./modules/takeOrder"),
  require("./modules/selectOrder"),
  require("./modules/executeTrade"),
  require("./modules/positions"),
  require("./modules/register"),
  require("./modules/topics"),
  require("./modules/modifyOrderBook"),
  require("./modules/generateOrderBook")
];

BigNumber.config({
  MODULO_MODE: BigNumber.EUCLID,
  ROUNDING_MODE: BigNumber.ROUND_HALF_DOWN
});

function Augur() {
  var i, len, fn;

  this.version = "3.15.7";

  this.options = {
    debug: {
      tools: false,       // if true, testing tools (test/tools.js) included
      abi: false,         // debug logging in augur-abi
      broadcast: false,   // broadcast debug logging in ethrpc
      connect: false,     // connection debug logging in ethrpc and ethereumjs-connect
      trading: false,     // trading-related debug logging
      reporting: false,   // reporting-related debug logging
      filters: false,     // filters-related debug logging
      sync: false,        // show warning on synchronous RPC request
      accounts: false     // show info about funding from faucet
    },
    loadZeroVolumeMarkets: true
  };
  this.protocol = NODE_JS || document.location.protocol;

  this.connection = null;
  this.coinbase = null;
  this.from = null;

  this.abi = require("augur-abi");
  this.constants = require("./constants");
  this.utils = require("./utilities");
  this.rpc = require("ethrpc");
  this.subscriptionsSupported = false;
  this.errors = this.rpc.errors;
  this.abi.debug = this.options.debug.abi;
  this.rpc.debug = this.options.debug;
  // TODO: make these functions prompt the user to interact with their ledger (e.g., plug it in, open the Ethereum app, change app settings on device) and then call the callback once the user indicates they are done
  var connectLedgerRequest = function (callback) { callback(new Error("connectLedgerRequest not implemented"), undefined); };
  var openEthereumAppRequest = function (callback) { callback(new Error("openEthereumAppRequest not implemented"), undefined); };
  var switchLedgerModeRequest = function (callback) { callback(new Error("switchLedgerModeRequest not implemented"), undefined); };
  var enableContractSupportRequest = function (callback) { callback(new Error("enableContractSupportRequest not implemented"), undefined); };
  this.ledger = new LedgerEthereum(LedgerEthereumNetwork.Test, LedgerBrowserConnectionFactory, pify(connectLedgerRequest), pify(openEthereumAppRequest), pify(switchLedgerModeRequest), pify(enableContractSupportRequest));

  // Load submodules
  for (i = 0, len = modules.length; i < len; ++i) {
    for (fn in modules[i]) {
      if (modules[i].hasOwnProperty(fn)) {
        this[fn] = modules[i][fn].bind(this);
        this[fn].toString = Function.prototype.toString.bind(modules[i][fn]);
      }
    }
  }
  this.accounts = this.Accounts();
  this.filters = this.Filters();
  this.chat = this.Chat();
  if (this.options.debug.tools) this.tools = require("../test/tools");
  this.sync();
}

Augur.prototype.Accounts = require("./accounts");
Augur.prototype.Filters = require("./filters");
Augur.prototype.Chat = require("./chat");

module.exports = Augur;
