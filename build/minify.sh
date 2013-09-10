#!/bin/bash

MY_PATH=$(dirname "$0")

# path to the yui compressor
YUICOMP_PATH="$MY_PATH/yuicompressor-2.4.7.jar";


if [ ! -d "$MY_PATH/../lib/" ]; then
    $(mkdir "$MY_PATH/../lib/")
fi

cat "$MY_PATH/../src/native/Array.js" \
    "$MY_PATH/../src/native/Math.js" \
    "$MY_PATH/../src/native/Object.js" > "$MY_PATH/../lib/artemijs.dev.js"
    
browserify "$MY_PATH/../src/Artemi.js" >> "$MY_PATH/../lib/artemijs.dev.js" -s ArtemiJS -d

sed -i 's/env: 1/env: 2/g' "$MY_PATH/../lib/artemijs.dev.js"
java -jar $YUICOMP_PATH --type js --charset utf-8 --nomunge --disable-optimizations -o "$MY_PATH/../lib/artemijs.test.js" "$MY_PATH/../lib/artemijs.dev.js"
sed -i 's/env: 2/env: 4/g' "$MY_PATH/../lib/artemijs.dev.js"
java -jar $YUICOMP_PATH --type js --charset utf-8 -o "$MY_PATH/../lib/artemijs.min.js" "$MY_PATH/../lib/artemijs.dev.js"
sed -i 's/env: 4/env: 1/g' "$MY_PATH/../lib/artemijs.dev.js"