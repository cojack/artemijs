#!/bin/bash

# path to the yui compressor
YUICOMP_PATH="";

mkdir ./../lib/

cat ../utils/Array.js \
    ../utils/Math.js \
    ../utils/Object.js \
    ../Artemi.js \
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
    ../World.js > ./../lib/artemijs.dev.js

sed -i 's/env: 1/env: 2/g' ./../lib/artemijs.dev.js
java -jar $YUICOMP_PATH --type js --charset utf-8 --nomunge --disable-optimizations -o ./../lib/artemijs.test.js ./../lib/artemijs.dev.js
sed -i 's/env: 2/env: 4/g' ./../lib/artemijs.dev.js
java -jar $YUICOMP_PATH --type js --charset utf-8 -o ./../lib/artemijs.min.js ./../lib/artemijs.dev.js
sed -i 's/env: 4/env: 1/g' ./../lib/artemijs.dev.js