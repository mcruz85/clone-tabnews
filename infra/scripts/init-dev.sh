#!/bin/bash

function cleanup {
    npm run services:stop
    exit 0
}

trap cleanup EXIT INT

npm run services:up && npm run services:wait:datebase && npm run migration:up && next dev --port 3020
