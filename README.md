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

  **Note** You can use F5 to start server when using Visual Studio Code.
* Run `npm run dev`. It starts webpack server on port `5000`.
* Navigate your browser to `http://localhost:5000`.

## Project files
The project contains following folders:
* .vscode - contains configuration files for Visual Studio Code.
* app - contains static content for application (such as html, css, images and so on).
* node_modules - contains node.js packages installed by `npm install`.
* src - source code of application in [TypeScript](https://www.typescriptlang.org/)
  * client - source code for front end
    * services - client side wrappers for backend services
    * main.ts - entry point for front end
  * server - source code for back end (Node.js)
    * server.ts - entry point for back end
    * authService.ts - implementation of authentication service (user authentication)
    * projectService.ts - implementation of project service (access to project information from BIM360)
    * serviceBase.ts - base class for service class
    * statusCodes.ts - definition of HTTP status codes
    * tsconfig.json - TypeScript configuration file
* webpack - configuration files for webpack
* .gitignore - contains list files to ignore when submitting changes to Git
* package.json - configuration file of an application. Contains definition of scripts, list of required packages etc.
 