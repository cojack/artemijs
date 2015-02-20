#!/bin/bash

MY_PATH=$(dirname "$0")

if [ ! -d "$MY_PATH/../web/js/lib/" ]; then
    $(mkdir "$MY_PATH/../web/js/lib/")
fi

if [ -f "$MY_PATH/../web/js/lib/game.js" ]; then
    $(rm "$MY_PATH/../web/js/lib/game.js")
fi

browserify "$MY_PATH/../web/js/src/Tutorial.js" >> "$MY_PATH/../web/js/lib/game.js" -d