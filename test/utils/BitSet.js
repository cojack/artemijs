/*global it,describe

@TODO Travis-CI is to slow for BitSet tests

var assert = require('assert'),
    should = require('should'),
    BitSet = require('./../../src/utils/BitSet');

describe('BitSet', function() {
    describe("#set()", function(){

        var bits = new BitSet();

        it("should set 1 million times fast", function(done){
            var begin = new Date().getTime();
            for(var i = 0; i < 1000000; i += 1){
                bits.set(i);
            }
            (new Date().getTime() - begin).should.be.below(50);
            done();
        });
    });


    describe("#clear()", function(){

        var bits = new BitSet();

        it("should set 1 million times fast", function(done){
            var begin = new Date().getTime();
            for(var i = 0; i < 1000000; i += 1){
                bits.set(i);
            }
            (new Date().getTime() - begin).should.be.below(50);
            done();
        });

        it("should clear half a million times fast", function(done){
            var begin = new Date().getTime();
            for(var i = 0; i < 1000000; i += 2){
                bits.clear(i);
            }
            (new Date().getTime() - begin).should.be.below(50);
            done();
        });
    });

    describe("#get()", function(){

        var bits = new BitSet();

        it("should set 1 million times fast", function(done){
            var begin = new Date().getTime();
            for(var i = 0; i < 1000000; i += 1){
                bits.set(i);
            }
            (new Date().getTime() - begin).should.be.below(50);
            done();
        });

        it("should clear half a million times fast", function(done){
            var begin = new Date().getTime();
            for(var i = 0; i < 1000000; i += 2){
                bits.clear(i);
            }
            (new Date().getTime() - begin).should.be.below(50);
            done();
        });

        
        it("should get 1 million times fast", function(done){
            var begin = new Date().getTime();
            for(var i = 0; i < 1000000; i += 1){
                (i & 1 ? bits.get(i) : !bits.get(i)).should.be.ok;
            }
            (new Date().getTime() - begin).should.be.below(800);
            done();
        });
    });

    describe("#cardinality()", function(){

        var bits = new BitSet();

        it("should set 1 million times fast", function(done){
            var begin = new Date().getTime();
            for(var i = 0; i < 1000000; i += 1){
                bits.set(i);
            }
            (new Date().getTime() - begin).should.be.below(50);
            done();
        });

        it("should clear half a million times fast", function(done){
            var begin = new Date().getTime();
            for(var i = 0; i < 1000000; i += 2){
                bits.clear(i);
            }
            (new Date().getTime() - begin).should.be.below(50);
            done();
        });

        it("should calculate cardinality fast", function(done){
            var begin = new Date().getTime();
            (bits.cardinality()).should.equal(500000);
            (new Date().getTime() - begin).should.be.below(50);
            done();
        });
    });

    describe("#nextSetBit()", function(){
        
        var bits = new BitSet();

        it("should set 1 million times fast", function(done){
            var begin = new Date().getTime();
            for(var i = 0; i < 1000000; i += 1){
                bits.set(i);
            }
            (new Date().getTime() - begin).should.be.below(50);
            done();
        });

        it("should clear half a million times fast", function(done){
            var begin = new Date().getTime();
            for(var i = 0; i < 1000000; i += 2){
                bits.clear(i);
            }
            (new Date().getTime() - begin).should.be.below(50);
            done();
        });

        it("should nextSetBit fast", function(done){
            var begin = new Date().getTime();
            for(var i = 0; i < 1000000; i += 1){
                (bits.nextSetBit(i)).should.equal(i & 1 ? i : i + 1);
            }
            (new Date().getTime() - begin).should.be.below(800);
            done();
        });
    });

    describe("#prevSetBit()", function(){

        var bits = new BitSet();

        it("should set 1 million times fast", function(done){
            var begin = new Date().getTime();
            for(var i = 0; i < 1000000; i += 1){
                bits.set(i);
            }
            (new Date().getTime() - begin).should.be.below(50);
            done();
        });

        it("should clear half a million times fast", function(done){
            var begin = new Date().getTime();
            for(var i = 0; i < 1000000; i += 2){
                bits.clear(i);
            }
            (new Date().getTime() - begin).should.be.below(50);
            done();
        });

        it("should prevSetBit fast", function(done){
            var begin = new Date().getTime();
            for(var i = 1; i < 1000000; i += 1){
                (bits.prevSetBit(i)).should.equal(i & 1 ? i : i - 1);
            }
            (new Date().getTime() - begin).should.be.below(800);
            done();
        });
    });
    
    describe("#toString()", function(){
        
        var bits = new BitSet();

        it("should set 1 million times fast", function(done){
            var begin = new Date().getTime();
            for(var i = 0; i < 1000000; i += 1){
                bits.set(i);
            }
            (new Date().getTime() - begin).should.be.below(50);
            done();
        });

        it("should clear half a million times fast", function(done){
            var begin = new Date().getTime();
            for(var i = 0; i < 1000000; i += 2){
                bits.clear(i);
            }
            (new Date().getTime() - begin).should.be.below(50);
            done();
        });

        it("should generate toString fast", function(done){
            bits.toString(16).should.be.ok;
            bits.toString(10).should.be.ok;
            bits.toString(10).should.equal(bits.toString(10));
            bits.toString(8).should.be.ok;
            //console.log(bits.toString(16));
            //console.log(bits.toString(10));
            //console.log(bits.toString(8));
            done();
        });
    });
});*/