'use strict';

var hasArgsRegex = /^[^(]+\([^)]+\)/;

function args (arg) {
    return [].slice.call(arg);
}

function invoke (mac, func, callback) {
    var called = false;
    var isFunc = typeof func === 'function';
    var hasArgs = isFunc && hasArgsRegex.test(func.toString());
    var result;

    function callbackWrapper (err) {
        if (!called) {
            called = true;
            callback();
        }
    }

    if (isFunc) {
        if (hasArgs) {
            func(callbackWrapper);
        } else {
            result = func();
        }
    } else {
        result = func;
    }

    if (result) {
        if (result.on) {
            result.on(mac.opts.on, callbackWrapper);
        } else if (result.then) {
            result.then(callbackWrapper, callbackWrapper);
        } else {
            callbackWrapper();
        }
    } else if (!hasArgs) {
        callbackWrapper();
    }
}

function Mac (opts) {
    this.opts = opts || {};
    this.opts = {
        on: this.opts.on || 'end'
    };
}

Mac.prototype = {
    parallel: function () {
        var index = 0;
        var funcs = args(arguments);
        var that = this;
        var total = funcs.length;

        return new Promise(function (resolve) {
            if (!total) {
                return resolve(that);
            }

            funcs.forEach(function (func) {
                invoke(that, func, function () {
                    ++index;

                    if (index === total) {
                        resolve(that);
                    }
                });
            });
        });
    },

    series: function () {
        var index = 0;
        var funcs = args(arguments);
        var that = this;
        var total = funcs.length;

        return new Promise(function (resolve) {
            function next () {
                invoke(that, funcs[index], function () {
                    ++index;

                    if (index === total) {
                        resolve(that);
                    } else {
                        next();
                    }
                });
            }

            if (!total) {
                return resolve(that);
            }

            next();
        });
    }
};

var mac = new Mac();
mac.mac = function (opts) { return new Mac(opts); };
mac.Mac = Mac;
module.exports = mac;
