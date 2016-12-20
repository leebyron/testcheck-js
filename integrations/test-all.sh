#!/bin/bash -e

pushd ${BASH_SOURCE%/*} > /dev/null

# Linking testcheck
npm link > /dev/null

# Loop through integrations, testing each
for integration in ./*/; do
  printf "\e[43;30m Test Integration: ${integration} \e[0m\n\n"
  pushd ${integration} > /dev/null
  npm link testcheck > /dev/null
  npm install
  npm test
  popd > /dev/null
done

popd > /dev/null
