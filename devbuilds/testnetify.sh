#!/bin/sh
sed -ie "s/version = '1.0'/version = '1.0t'/" ./node_modules/core/constants.js
