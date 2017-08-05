const request = require('request');
const Promise = require('bluebird');
const ExponentialBackoff = require('./exponential-backoff');
const Table = require('cli-table');

let expb = new ExponentialBackoff();
expb.collision(0); // Init the default collision count to zero
const MAX_RETRIES = 50;

module.exports = class HttpClient {

    /**
     * Makes a HTTP request
     * @param {Object} options 
     * @see https://github.com/request/request#requestoptions-callback
     */
    static request(options) {
        return new Promise((res, rej) => {
            
            request(options, (err, resp) => {
                if (resp.statusCode >= 500) {
                    let table = new Table();
                    table.push(
                        {'Error': resp.body},
                        {'Retry attempt': expb.getCollisionNumber() + 1},
                        {'Error code': resp.statusCode}
                    );
                    console.log(table.toString()); // Print the error to the console
                    
                    // Server Error; Give a retry
                    let collisionCount = expb.getCollisionNumber() + 1; // Get the current collision count
                    let waitTime = expb
                        .collision(collisionCount)
                        .expectedBackOffTime();

                    if (MAX_RETRIES >= collisionCount) {
                        setTimeout(() => {
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
                        rej(new Error(resp.body));
                    }
                } else if (resp.statusCode >= 400) {
                    // Reset the collision counter
                    expb.collision(0);
                    // Client Error; Notify the client; Reject promise
                    rej(new Error(resp.body));
                } else if (resp.statusCode >= 200 && resp.statusCode < 300) {
                    // Reset the collision counter
                    expb.collision(0);
                    // All well!! Resolve the promise
                    res(resp.body);
                }
            })
        })
    }
}