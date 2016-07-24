/**
 * Augur JavaScript API
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var BigNumber = require("bignumber.js");
var clone = require("clone");
var abi = require("augur-abi");
var utils = require("../utilities");

BigNumber.config({MODULO_MODE: BigNumber.EUCLID});

module.exports = {

    createSingleEventMarket: function (branchId, description, expDate, minValue, maxValue, numOutcomes, resolution, takerFee, tags, makerFee, extraInfo, onSent, onSuccess, onFailed) {
        var self = this;
        if (branchId.constructor === Object && branchId.branchId) {
            description = branchId.description;         // string
            expDate = branchId.expDate;
            minValue = branchId.minValue;               // integer (1 for binary)
            maxValue = branchId.maxValue;               // integer (2 for binary)
            numOutcomes = branchId.numOutcomes;         // integer (2 for binary)
            resolution = branchId.resolution;
            takerFee = branchId.takerFee;
            tags = branchId.tags;
            makerFee = branchId.makerFee;
            extraInfo = branchId.extraInfo;
            onSent = branchId.onSent;                   // function
            onSuccess = branchId.onSuccess;             // function
            onFailed = branchId.onFailed;               // function
            branchId = branchId.branchId;               // sha256 hash
        }
        var formattedTags = this.formatTags(tags);
        var fees = this.calculateTradingFees(makerFee, takerFee);
        expDate = parseInt(expDate);
        if (description) description = description.trim();
        if (resolution) resolution = resolution.trim();
        var tx = clone(this.tx.CreateMarket.createSingleEventMarket);
        tx.params = [
            branchId,
            description,
            expDate,
            abi.fix(minValue, "hex"),
            abi.fix(maxValue, "hex"),
            numOutcomes,
            resolution || "",
            abi.fix(fees.tradingFee, "hex"),
            formattedTags[0],
            formattedTags[1],
            formattedTags[2],
            abi.fix(fees.makerProportionOfFee, "hex"),
            extraInfo || ""
        ];
        if (!utils.is_function(onSent)) {
            var gasPrice = this.rpc.getGasPrice();
            tx.gasPrice = gasPrice;
            tx.value = this.calculateRequiredMarketValue(gasPrice);
            var res = this.transact(tx);
            res.marketID = res.callReturn;
            return res;
        }
        this.rpc.getGasPrice(function (gasPrice) {
            tx.gasPrice = gasPrice;
            tx.value = self.calculateRequiredMarketValue(gasPrice);
            self.transact(tx, onSent, function (res) {
                res.marketID = res.callReturn;
                onSuccess(res);
            }, onFailed);
        });
    },

    createEvent: function (branchId, description, expDate, minValue, maxValue, numOutcomes, resolution, onSent, onSuccess, onFailed) {
        if (branchId.constructor === Object && branchId.branchId) {
            description = branchId.description;         // string
            minValue = branchId.minValue;               // integer (1 for binary)
            maxValue = branchId.maxValue;               // integer (2 for binary)
            numOutcomes = branchId.numOutcomes;         // integer (2 for binary)
            expDate = branchId.expDate;
            resolution = branchId.resolution;
            onSent = branchId.onSent;                   // function
            onSuccess = branchId.onSuccess;             // function
            onFailed = branchId.onFailed;               // function
            branchId = branchId.branchId;               // sha256 hash
        }
        var tx = clone(this.tx.CreateMarket.createEvent);
        if (description) description = description.trim();
        if (resolution) resolution = resolution.trim();
        tx.params = [
            branchId,
            description,
            parseInt(expDate),
            abi.fix(minValue, "hex"),
            abi.fix(maxValue, "hex"),
            numOutcomes,
            resolution || ""
        ];
        return this.transact(tx, onSent, onSuccess, onFailed);
    },

    createMarket: function (branchId, description, takerFee, events, tags, makerFee, extraInfo, onSent, onSuccess, onFailed) {
        var self = this;
        if (branchId.constructor === Object && branchId.branchId) {
            description = branchId.description; // string
            takerFee = branchId.takerFee;
            events = branchId.events;           // array [sha256, ...]
            tags = branchId.tags;
            makerFee = branchId.makerFee;
            extraInfo = branchId.extraInfo;
            onSent = branchId.onSent;           // function
            onSuccess = branchId.onSuccess;     // function
            onFailed = branchId.onFailed;       // function
            branchId = branchId.branchId;       // sha256 hash
        }
        onSent = onSent || utils.noop;
        onSuccess = onSuccess || utils.noop;
        onFailed = onFailed || utils.noop;
        var formattedTags = this.formatTags(tags);
        var fees = this.calculateTradingFees(makerFee, takerFee);
        var tx = clone(this.tx.CreateMarket.createMarket);
        if (description) description = description.trim();
        tx.params = [
            branchId,
            description,
            abi.fix(fees.tradingFee, "hex"),
            events,
            formattedTags[0],
            formattedTags[1],
            formattedTags[2],
            abi.fix(fees.makerProportionOfFee, "hex"),
            extraInfo || ""
        ];
        if (!utils.is_function(onSent)) {
            var gasPrice = this.rpc.getGasPrice();
            tx.gasPrice = gasPrice;
            tx.value = this.calculateRequiredMarketValue(gasPrice);
            var periodLength = this.getPeriodLength(branchId);
            var res = this.transact(tx);
            res.marketID = res.callReturn;
            return res;
        }
        this.rpc.getGasPrice(function (gasPrice) {
            tx.gasPrice = gasPrice;
            tx.value = self.calculateRequiredMarketValue(gasPrice);
            self.getPeriodLength(branchId, function (periodLength) {
                self.transact(tx, onSent, function (res) {
                    res.marketID = res.callReturn;
                    onSuccess(res);
                }, onFailed);
            });
        });
    },

    updateTradingFee: function (branch, market, tradingFee, onSent, onSuccess, onFailed) {
        var tx = clone(this.tx.CreateMarket.updateTradingFee);
        var unpacked = utils.unpack(branch, utils.labels(this.updateTradingFee), arguments);
        tx.params = unpacked.params;
        tx.params[2] = abi.fix(tx.params[2], "hex");
        return this.transact.apply(this, [tx].concat(unpacked.cb));
    }
};
