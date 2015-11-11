(function() {
    'use strict';

    /**
     * @property delay
     * @private
     * @type {Number}
     */
    var delay;

    /**
     * @property repeat
     * @private
     * @type {boolean}
     */
    var repeat;

    /**
     * @property acc
     * @private
     * @type {Number}
     */
    var acc;

    /**
     * @property done
     * @private
     * @type {boolean}
     */
    var done;

    /**
     * @property stopped
     * @private
     * @type {boolean}
     */
    var stopped;


    /**
     * Timer
     *
     * @class Timer
     * @namespace Utils
     * @module ArtemiJS
     * @submodule Utils
     * @param {Number} _delay
     * @param {boolean} _repeat
     * @constructor
     */
    var Timer = function Timer(_delay, _repeat) {
        delay = _delay;
        repeat = _repeat || false;
        acc = 0;

        /**
         * Update timer
         *
         * @param delta
         */
        this.update = function(delta) {
            if(!done && !stoped) {
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
         *
         * @param _delay
         */
        this.setDelay = function(_delay) {
            delay = _delay;
        };

        this.execute = function() {};

        /**
         *
         * @returns {number}
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
})();