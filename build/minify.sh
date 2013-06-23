#!/bin/bash

# path to the yui compressor
YUICOMP_PATH="";

cat ../utils/Array.js \
    ../utils/Math.js \
    ../utils/Object.js \
    ../Artemis.js \
    ../utils/Assert.js \
    ../utils/Bag.js \
    ../utils/BitSet.js \
    ../Aspect.js \
    ../Manager.js \
    ../Component.js \
    ../ComponentManager.js \
    ../ComponentMapper.js \
    ../EntityObserver.js \
    ../Entity.js \
    ../EntityManager.js \
    ../EntitySystem.js \
    ../World.js > artemijs.dev.js

sed -i 's/env: 1/env: 2/g' artemijs.dev.js
java -jar $YUICOMP_PATH --type js --charset utf-8 --nomunge --disable-optimizations -o artemijs.test.js $(pwd)/artemijs.dev.js
sed -i 's/env: 2/env: 4/g' artemijs.dev.js
java -jar $YUICOMP_PATH --type js --charset utf-8 -o artemijs.min.js $(pwd)/artemijs.dev.js
sed -i 's/env: 4/env: 1/g' artemijs.dev.js