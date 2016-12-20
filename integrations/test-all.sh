#!/bin/bash -e

pushd ${BASH_SOURCE%/*} > /dev/null

# Link testcheck
npm link

# Loop through integrations, testing each
for integration in ./*; do
  if [ -d "${integration}" ] ; then
    pushd ${integration}

    npm link testcheck
    npm install
    npm test

    popd
  fi
done

popd > /dev/null
