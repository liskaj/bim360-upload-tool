import * as express from 'express';
import * as forge from 'forge-apis';
import * as uid from 'uid-safe';

import { ServiceBase } from './serviceBase';
import { AuthService } from './authService';
import { StatusCodes } from './statusCodes';

export class ProjectService extends ServiceBase {
    constructor(options: any, private _authSvc: AuthService) {
        super(options);
    }

    protected initializeRoutes(): void {
        this.router.get('/projects', (req: express.Request, res: express.Response) => {
            this.getProjects(req, res);
        });
        this.router.post('/import', (req: express.Request, res: express.Response) => {
            this.createImport(req, res);
        });
    }

    private async createImport(req: express.Request, res: express.Response) {
        try {
            /*const client = this._authSvc.getClient(true);
            const credentials = await this._authSvc.getInternalToken(req);

            if (!credentials) {
                return res.status(StatusCodes.Unauthorized).end();
            }*/
            const input = req.body;
            const rules = await this.readData(`${__dirname}/data/rules.json`);
            const result = {
                locations: []
            };

            input.files.forEach((f) => {
                for (let i = 0; i < rules.length; i++) {
                    const rule = rules[i];
                    const pattern = new RegExp(rule.pattern, 'i');

                    if (f.name.match(pattern)) {
                        result.locations.push({
                            file: f.name,
                            path: rule.location
                        });
                        break;
                    }
                }
            });
            res.status(StatusCodes.OK).json(result);
        }
        catch (err) {
            res.status(StatusCodes.InternalServerError).json({ error: err });
        }
    }

    private async getProjects(req: express.Request, res: express.Response) {
        try {
            const client = this._authSvc.getClient(true);
            const credentials = await this._authSvc.getInternalToken(req);

            if (!credentials) {
                return res.status(StatusCodes.Unauthorized).end();
            }
            const projectsApi = new forge.ProjectsApi();

            const projects = await projectsApi.getHubProjects(this.options.hubID, {}, client, credentials);
            const result = projects.body.data.map((p) => {
                return {
                    id: p.id,
                    name: p.attributes.name
                };
            });

            res.status(StatusCodes.OK).json(result);
        }
        catch (err) {
            res.status(StatusCodes.InternalServerError).json({ error: err });
        }
    }
}
