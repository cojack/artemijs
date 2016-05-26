!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.SpaceshipWarrior=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){

(function() {
    /* global requestAnimationFrame, ArtemiJS*/

    'use strict';

    var GameScreen = require('./GameScreen');

    var SpaceshipWarrior = function SpaceshipWarrior() {

        var stats;

        var gameScreen;
        /**
         * @param Float delta
         */
        this.start = function() {
            this.initStats();

            gameScreen = new GameScreen();

            render(0);
        };

        this.initStats = function() {
            stats = new Stats();
            stats.setMode(1); // 0: fps, 1: ms

            // Align top-left
            stats.domElement.style.position = 'absolute';
            stats.domElement.style.left = '0px';
            stats.domElement.style.top = '0px';

            document.body.appendChild( stats.domElement );
        };

        function render(delta) {
            window.requestAnimationFrame(render);
            gameScreen.render(delta);
            stats.update();
        }
    };

    SpaceshipWarrior.FRAME_WIDTH = 1200;
    SpaceshipWarrior.FRAME_HEIGHT = 900;

    module.exports = SpaceshipWarrior;
})();