# BIM360 Upload Tool

This project contains skeleton for upload tool for BIM 360.

## Environment variables
Before running the application it's necessary to configure following environment variables:
* FORGE_CLIENT_ID - client ID of Forge application
* FORGE_CLIENT_SECRET - client secret of Forge application
* FORGE_CALLBACK_URL - callback to recive authentication token from Forge

## BIM360 Configuration
It's necessary to white list your Forge application in BIM360. This can be done via Account Administration.

## Local development
Use following steps to setup environment for local development:
* Get latest code from Git.
* Run `npm install`.
* Run `npm run build:server`.
* Start server. Then server will run on port `3000`.
* Run `npm run dev`. It starts webpack server on port `5000`.
* Navigate your browser to `http://localhost:5000`.
 