'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @see https://en.wikipedia.org/wiki/Exponential_backoff
 */
module.exports = function () {
    function ExponentialBackoff() {
        _classCallCheck(this, ExponentialBackoff);
    }

    _createClass(ExponentialBackoff, [{
        key: 'collision',


        /**
         * Sets the collision number
         * @param {Number} collisionNumber 
         */
        value: function collision(collisionNumber) {
            this.c = collisionNumber;
            return this;
        }

        /**
         * Gets the currently set collision number
         * @return {Number}
         */

    }, {
        key: 'getCollisionNumber',
        value: function getCollisionNumber() {
            return this.c ? this.c : 0;
        }

        /**
         * Given a uniform distribution of backoff times, the expected backoff time 
         * is the mean of the possibilities. That is, after c collisions, 
         * the number of backoff slots is in [0, 1, ..., N], where N = 2^c − 1 
         */

    }, {
        key: 'numberOfBackoffSlots',
        value: function numberOfBackoffSlots() {
            var N = 0;
            if ('number' === typeof this.c) {
                N = Math.pow(2, this.c) - 1;
            }
            return N;
        }

        /**
         * Expected backoff time (in slots) is
         * 1/(N+1) * (Sum of numbers from 0 to N)
         * @return {Number} Wait time in seconds
         */

    }, {
        key: 'expectedBackOffTime',
        value: function expectedBackOffTime() {
            var N = this.numberOfBackoffSlots();
            return Math.ceil(1 / (N + 1) * (N * (1 + N) / 2));
        }
    }]);

    return ExponentialBackoff;
}();