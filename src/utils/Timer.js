'use strict';

/**
 * Timer
 *
 * @class Timer
 * @param {Number} delay
 * @param {boolean} repeat
 * @constructor
 * @memberof Utils
 */
var Timer = function Timer(delay, repeat) {

    /**
     * @private
     * @member {Number}
     */
    var delay = delay || 0,

    /**
     * @private
     * @member {boolean}
     */
    repeat = repeat || false,

    /**
     * @private
     * @member {Number}
     */
    acc = 0,

    /**
     * @private
     * @member {boolean}
     */
    done,

    /**
     * @private
     * @member {boolean}
     */
    stopped;

    /**
     * Update timer
     *
     * @param delta
     */
    this.update = function(delta) {
        if(!done && !stopped) {
            acc += delta;
            if (acc >= delay) {
                acc -= delay;

                if (repeat) {
                    this.reset();
                } else {
                    done = true;
                }

                this.execute();
            }
        }
    };

    /**
     * Reset timer
     */
    this.reset = function() {
        stopped = false;
        done = false;
        acc = 0;
    };

    /**
     * Returns true if is done otherwise false
     *
     * @returns {boolean}
     */
    this.isDone = function() {
        return done;
    };

    /**
     * Returns true if is running otherwise false
     *
     * @returns {boolean}
     */
    this.isRunning = function() {
        return !done && acc < delay && !stopped;
    };

    /**
     * Stop timer
     */
    this.stop = function() {
        stopped = true;
    };

    /**
     * Set delay
     *
     * @param delay
     */
    this.setDelay = function(delay) {
        delay = delay || 0;
    };

    this.execute = function() {};

    /**
     *
     * @returns {Number}
     */
    this.getPercentageRemaining = function() {
        if (done)
            return 100;
        else if (stopped)
            return 0;
        else
            return 1 - (delay - acc) / delay;
    };

    /**
     *
     * @returns {Number}
     */
    this.getDelay = function() {
        return delay;
    };

};

module.exports = Timer;