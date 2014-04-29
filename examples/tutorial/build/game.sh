#!/bin/bash

MY_PATH=$(dirname "$0")

if [ ! -d "$MY_PATH/../lib/" ]; then
    $(mkdir "$MY_PATH/../lib/")
fi

if [ -f "$MY_PATH/../lib/game.js" ]; then
    $(rm "$MY_PATH/../lib/game.js")
fi

browserify "$MY_PATH/../src/Tutorial.js" >> "$MY_PATH/../lib/game.js" -d