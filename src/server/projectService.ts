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
