import * as express from 'express';

export class ServiceBase {
    private _router: express.Router;

    constructor(private _options: any) {
        this._router = express.Router();
        this.initializeRoutes();
    }

    public get router(): express.Router {
        return this._router;
    }

    protected get options(): any {
        return this._options;
    }

    protected initializeRoutes(): void {
    }
}
