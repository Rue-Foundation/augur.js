/**
 * augur.js unit tests
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var assert = require("chai").assert;
var constants = require("../src/constants");
var contracts = require("../src/contracts");
var utilities = require("../src/utilities");
var Augur = utilities.setup(require("../src"), process.argv.slice(2));
var log = console.log;

require('it-each')({ testPerIteration: true });

var nodes = [
    "http://localhost:8545",
    "http://69.164.196.239:8545",
    "http://poc9.com:8545",
    "http://45.33.59.27:8545"
];

describe("RPC multicast", function () {
    
    var rpc_cnt = 0;
    var command = { id: ++rpc_cnt, jsonrpc: "2.0", method: "eth_coinbase", params: [] };

    it("should reload modules with new nodes in Augur.rpc.nodes", function () {
        Augur.options.nodes = nodes;
        Augur.reload_modules(Augur.options);
        assert(utilities.array_equal(Augur.rpc.nodes.slice(1), nodes));
    });

    Augur.options.nodes = nodes;
    Augur.reload_modules(Augur.options);
    
    it.each(Augur.rpc.nodes, "should synchronously post eth_coinbase RPC to %s", ["element"], function (element, next) {
        this.timeout(constants.timeout);

        assert.equal(Augur.rpc.postSync(element, command).length, 42);
        next();
    });

    it.each(Augur.rpc.nodes, "should asynchronously post eth_coinbase RPC to %s", ["element"], function (element, next) {

        Augur.rpc.post(element, JSON.stringify(command), null, function (response) {
            this.timeout(constants.timeout);

            assert.equal(response.length, 42);

            // nothing found, go to the next node
            if (!response || !response.length || response === "0x") {
                log("next...", response);
                next();
            } else {
                log(response);
                return true;
            }
        });

    });

    it.each(Augur.rpc.nodes, "should use json_rpc wrapper to return on first successful RPC", ["element"], function (element, next) {
        
        assert.equal(Augur.rpc.json_rpc(command).length, 42);
        next();
    });

});