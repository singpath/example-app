#!/usr/bin/env bash
#
# !!! Assumed to be run via a npm run command !!!
# 
set -e

DIST=dist/
OUTPUT=${DIST}/example-app.js
OUTPUT_MIN=${DIST}/example-app.min.js


echo "Emptying ${DIST}..."
rm -rf "$DIST"
mkdir -p "$DIST"


echo "Setting up assets in ${DIST}..."
cp LICENSE tools/assets/dist/* "$DIST"


echo "Buidling ${OUTPUT}..."
jspm build example-app - angular - angular-route - firebase - rxjs/bundles/Rx.umd.js "$OUTPUT" \
	--global-name exampleApp \
	--global-deps "{'angular/angular.js':'angular', 'angular-route/angular-route.js': 'angular', 'firebase/firebase.js':'firebase', 'rxjs/bundles/Rx.umd.js':'Rx'}" \
	--format umd --skip-source-maps 


echo "Buidling ${OUTPUT_MIN}..."
jspm build example-app - angular - angular-route - firebase - rxjs/bundles/Rx.umd.js "$OUTPUT_MIN" \
	--global-name exampleApp \
	--global-deps "{'angular/angular.js':'angular', 'angular-route/angular-route.js': 'angular', 'firebase/firebase.js':'firebase', 'rxjs/bundles/Rx.umd.js':'Rx'}" \
	--format umd --skip-source-maps --minify
