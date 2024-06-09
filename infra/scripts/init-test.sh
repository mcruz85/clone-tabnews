#!/bin/bash

function cleanup {
    err=$?
    echo "Cleaning stuff up..."
    npm run services:stop
    exit $err 
}

trap cleanup EXIT INT   

npm run services:up && npm run wait-for-postgres && concurrently -n next,jest --hide next -k --success command-jest "sleep 5;next dev --port 3020" "jest --runInBand --verbose" 


