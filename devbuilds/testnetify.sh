#!/bin/sh
if [ -f ../node_modules/core/constants.js ]
then
  sed -ie "s/version = '1.0'/version = '1.0t'/" ../node_modules/core/constants.js
else
  sed -ie "s/version = '1.0'/version = '1.0t'/" ./node_modules/core/constants.js
fi
