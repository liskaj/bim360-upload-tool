import { AppController } from './appController';

let appController: AppController;

$(document).ready(() => {
    console.debug(`document is ready`);
    appController = new AppController();
    appController.initialize();
});
