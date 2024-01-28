#!/bin/bash

if [ "$ENABLE_STOREFRONT" == "yes" ]
then
    # Enable
    set -m
    # Start the frontend server
    yarn --cwd store-frontend start &
    # Start the backend server
    yarn --cwd store-backend start
else
    # Start the backend server
    yarn --cwd store-backend start
fi