#!/usr/bin/env bash
#
#
# !!! Assumed to be run via a npm run command !!!
# 
# 		npm run build
# 
set -e

DIST=dist
OUTPUT=${DIST}/example-app.js
OUTPUT_MIN=${DIST}/example-app.min.js
OUTPUT_TREE=${DIST}/example-app.tree.html


echo "Emptying ${DIST}/..."
rm -rf "${DIST}/"
mkdir -p "${DIST}/"


echo "Setting up assets in ${DIST}..."
cp LICENSE tools/assets/dist/* "${DIST}/"


echo "Buidling ${OUTPUT}..."
jspm build example-app - angular - angular-route - firebase - rxjs/bundles/Rx.umd.js "$OUTPUT" \
	--global-name exampleApp \
	--global-deps "{'angular/angular.js':'angular', 'angular-route/angular-route.js': 'angular', 'firebase/firebase.js':'firebase', 'rxjs/bundles/Rx.umd.js':'Rx'}" \
	--format umd --skip-source-maps 


echo "Buidling ${OUTPUT_MIN}..."
jspm build example-app - angular - angular-route - firebase - rxjs/bundles/Rx.umd.js "$OUTPUT_MIN" \
	--global-name exampleApp \
	--global-deps "{'angular/angular.js':'angular', 'angular-route/angular-route.js': 'angular', 'firebase/firebase.js':'firebase', 'rxjs/bundles/Rx.umd.js':'Rx'}" \
	--format umd --minify

# You don't want the browser to load the source map file
# (the source map is often as big as the bundle).
# So we are stripping the source map directive in the bundle
# by stripping the last line.
echo "Removing source map directive from ${OUTPUT_MIN}..."
sed '$ d' ${OUTPUT_MIN} > ${OUTPUT_MIN}.no-src-map
mv ${OUTPUT_MIN}.no-src-map ${OUTPUT_MIN}


echo "Analysing source map..."
source-map-explorer --html "$OUTPUT_MIN"{,.map} > "$OUTPUT_TREE"

echo 'open "'${OUTPUT_TREE}'" to find weight of each modules.'
