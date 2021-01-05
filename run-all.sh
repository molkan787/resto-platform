#!/bin/bash

set -m
  
# Start the frontend server
yarn --cwd store-frontend dev &
  
# Start the backend server
yarn --cwd store-backend develop