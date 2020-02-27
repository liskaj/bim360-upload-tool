import * as express from 'express';
import * as fs from 'fs';

import axios from 'axios';

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

    protected post(url: string, token: string, inputs?: any, params?: any, additionalHeaders?: { [key: string]: string }): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let headers = {
                'Authorization': `Bearer ${token}`,
            };

            if (additionalHeaders) {
                headers = Object.assign(headers, additionalHeaders);
            } else  {
                headers['Accept'] = 'application/json';
                headers['Content-Type'] = 'application/json';
            }
            axios({
                method: 'post',
                url: url,
                headers: headers,
                data: inputs,
                params: params
            }).then((res) => {
                resolve(res.data);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    protected put(url: string, token: string, inputs?: any, params?: any, additionalHeaders?: { [key: string]: string }): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let headers = {
                'Authorization': `Bearer ${token}`
            };
            if (additionalHeaders) {
                headers = Object.assign(headers, additionalHeaders);
            }

            axios({
                method: 'put',
                url: url,
                headers: headers,
                data: inputs,
                params: params
            }).then((res) => {
                resolve(res.data);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    protected readData(fileName: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            fs.readFile(fileName, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    protected readDataAsJson(fileName: string): Promise<any> {
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
