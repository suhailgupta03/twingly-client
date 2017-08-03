/**
 * @see https://en.wikipedia.org/wiki/Exponential_backoff
 */
module.exports = class ExponentialBackoff {

    /**
     * Sets the collision number
     * @param {Number} collisionNumber 
     */
    collision(collisionNumber) {
        this.c = collisionNumber;
        return this;
    }

    /**
     * Gets the currently set collision number
     * @return {Number}
     */
    getCollisionNumber() {
        return this.c ? this.c : 0;
    }

    /**
     * Given a uniform distribution of backoff times, the expected backoff time 
     * is the mean of the possibilities. That is, after c collisions, 
     * the number of backoff slots is in [0, 1, ..., N], where N = 2^c − 1 
     */
    numberOfBackoffSlots() {
        let N = 0;
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
    expectedBackOffTime() {
        let N = this.numberOfBackoffSlots();
        return Math.ceil((1 / (N + 1)) * ((N * (1 + N)) / 2));
    }
}