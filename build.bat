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
npm link @digital-boss/n8n-nodes-odoo
npx n8n