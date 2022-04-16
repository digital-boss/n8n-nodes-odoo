#!/bin/bash

npm install
npm run build
npm link
cd ..
mkdir n8n_install
cd n8n_install
npm init
npm install
npm install n8n
npm link n8n-nodes-starter
npx n8n