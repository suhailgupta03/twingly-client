'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _request = require('request');
var Promise = require('bluebird');
var ExponentialBackoff = require('./exponential-backoff');
var expb = new ExponentialBackoff();
expb.collision(0); // Init the default collision count to zero
var MAX_RETRIES = 50;

module.exports = function () {
    function HttpClient() {
        _classCallCheck(this, HttpClient);
    }

    _createClass(HttpClient, null, [{
        key: 'request',


        /**
         * Makes a HTTP request
         * @param {Object} options 
         * @see https://github.com/request/request#requestoptions-callback
         */
        value: function request(options) {
            return new Promise(function (res, rej) {

                _request(options, function (err, resp) {
                    if (resp.statusCode >= 500) {
                        // Server Error; Give a retry
                        var collisionCount = expb.getCollisionNumber() + 1; // Get the current collision count
                        var waitTime = expb.collision(collisionCount).expectedBackOffTime();

                        if (MAX_RETRIES >= collisionCount) {
                            setTimeout(function () {
                                // Update the new collision count
                                expb.collision(collisionCount);
                                // Make a new request; Recursive call
                                HttpClient.request(options);
                            }, waitTime * 1000);
                        } else {
                            /**
                             * Number of collisions have surpassed the maximum
                             * number of allowed retries
                             */
                            rej(err);
                        }
                    } else if (resp.statusCode >= 400) {
                        // Reset the collision counter
                        expb.collision(0);
                        // Client Error; Notify the client; Reject promise
                        rej(err, resp);
                    } else if (resp.statusCode >= 200 && resp.statusCode < 300) {
                        // Reset the collision counter
                        expb.collision(0);
                        // All well!! Resolve the promise
                        res(resp.body);
                    }
                });
            });
        }
    }]);

    return HttpClient;
}();