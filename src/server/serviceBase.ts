import * as express from 'express';
import * as fs from 'fs';

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

    protected readData(fileName: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            fs.readFile(fileName, 'utf-8', (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(JSON.parse(data));
                }
            });
        });
    }
}
