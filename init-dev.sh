#!/bin/bash

function cleanup {
    npm run services:stop
    exit 0
}

trap cleanup INT

npm run services:up && next dev --port 3020
