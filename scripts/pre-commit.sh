#!/bin/bash
# ln -s ../../scripts/pre-commit.sh .git/hooks/pre-commit to install it

npm run check || exit 1
npm run test || exit 1
