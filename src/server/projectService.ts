import * as express from 'express';
import * as forge from 'forge-apis';
import * as formidable from 'formidable';

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
        this.router.post('/package', (req: express.Request, res: express.Response) => {
            this.createPackage(req, res);
        });
        this.router.post('/upload', (req: express.Request, res: express.Response) => {
            this.upload(req, res);
        });
    }

    private async createPackage(req: express.Request, res: express.Response) {
        try {
            const input = req.body;
            const rules = await this.readDataAsJson(`${__dirname}/data/rules.json`);
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
            // create mapping between path and id
            const folderPaths = {};

            rules.forEach((r) => {
                folderPaths[r.location] = r.folderID;
            });
            // create storage for each uploaded file
            const credentials = await this._authSvc.getInternalToken(req);

            if (!credentials) {
                return res.status(StatusCodes.Unauthorized).end();
            }
            for (const location of result.locations) {
                const folderID = folderPaths[location.path];
                const storage = await this.createStorage(credentials.access_token, input.project, folderID, location.file);

                location.folder = folderID;
                location.storage = storage.data.id;
            }
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

    private async upload(req: express.Request, res: express.Response) {
        try {
            const credentials = await this._authSvc.getInternalToken(req);

            if (!credentials) {
                return res.status(StatusCodes.Unauthorized).end();
            }
            const formData = await this.parseFormData(req);
            const storageData = this.parseStorageUrn(formData.fields.storage);
            const data = await this.readData(formData.files.file.path);
            const uploadResult = await this.uploadObject(credentials.access_token, storageData.bucket, storageData.objectName, data, formData.files.file.type);
            // find if there is item with same name
            const searchResult = await this.findItem(credentials.access_token, formData.fields.project, formData.fields.folder, formData.fields.name);
            let result;

            if (searchResult.data.length > 0) {
                const versionResult = await this.createItemVersion(credentials.access_token, formData.fields.project, searchResult.data[0].id, uploadResult.objectId, formData.fields.name);

                result = {
                    item: versionResult.included[0].id,
                    file: versionResult.data.id,
                    version: versionResult.data.versionNumber
                };
            } else {
                const itemResult = await this.createItem(credentials.access_token, formData.fields.project, formData.fields.folder, uploadResult.objectId, formData.fields.name);

                result = {
                    item: itemResult.data.id,
                    file: itemResult.included[0].id,
                    version: itemResult.included[0].attributes.versionNumber
                };
            }
            res.status(StatusCodes.OK).json(result);
        }
        catch (err) {
            res.status(StatusCodes.InternalServerError).json({ error: err });
        }
    }

    private async createItem(token: string, projectID: string, folderID: string, objectID: string, displayName: string) {
        const url = `https://developer.api.autodesk.com/data/v1/projects/${projectID}/items`;
        const inputs = {
            jsonapi: {
                version: '1.0'
            },
            data: {
                type: 'items',
                attributes: {
                    displayName: displayName,
                    extension: {
                        type: 'items:autodesk.bim360:File',
                        version: '1.0'
                    }
                },
                relationships: {
                    tip: {
                        data: {
                            type: 'versions',
                            id: '1'
                        }
                    },
                    parent: {
                        data: {
                            type: 'folders',
                            id: folderID
                        }
                    }
                }
            },
            included: [
                {
                    type: 'versions',
                    id: '1',
                    attributes: {
                        name: displayName,
                        extension: {
                            type: 'versions:autodesk.bim360:File',
                            version: '1.0'
                        }
                    },
                    relationships: {
                        storage: {
                            data: {
                                type: 'objects',
                                id: objectID
                            }
                        }
                    }
                }
            ]
        };

        return this.post(url, token, inputs, null, { 'Content-Type': 'application/vnd.api+json' });
    }

    private async createItemVersion(token: string, projectID: string, itemID: string, objectID: string, displayName: string) {
        const url = `https://developer.api.autodesk.com/data/v1/projects/${projectID}/versions`;
        const inputs = {
            jsonapi: {
                version: '1.0'
            },
            data: {
                type: 'versions',
                attributes: {
                    name: displayName,
                    extension: {
                        type: 'versions:autodesk.bim360:File',
                        version: '1.0'
                    }
                },
                relationships: {
                    item: {
                        data: {
                            type: 'items',
                            id: itemID
                        }
                    },
                    storage: {
                        data: {
                            type: 'objects',
                            id: objectID
                        }
                    }
                }
            }
        };

        return this.post(url, token, inputs, null, { 'Content-Type': 'application/vnd.api+json' });
    }

    private async createStorage(token: string, projectID: string, folderID: string, fileName: string) {
        const url = `https://developer.api.autodesk.com/data/v1/projects/${projectID}/storage`;
        const inputs = {
            jsonapi: {
                version: '1.0'
            },
            data: {
                type: 'objects',
                attributes: {
                    name: fileName
                },
                relationships: {
                    target: {
                        data: {
                            type: 'folders',
                            id: folderID
                        }
                    }
                }
            }
        };
        return this.post(url, token, inputs);
    }

    private async findItem(token: string, projectID: string, folderID: string, displayName: string): Promise<any> {
        const url = `https://developer.api.autodesk.com/data/v1/projects/${projectID}/folders/${folderID}/contents?filter[displayName]=${displayName}`;

        return this.get(url, token);
    }

    private async uploadObject(token: string, bucketKey: string, objectName: string, data: any, contentType?: string) {
        const url = `https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects/${objectName}`;
        let headers = null;

        if (contentType) {
            headers = {
                'Content-Type': contentType
            };
        }
        return this.put(url, token, data, null, headers);
    }

    private parseFormData(req): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const form = formidable({ multiples: true });

            form.parse(req, (err, fields, files) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        fields: fields,
                        files: files
                    });
                }
            });
        });
    }

    private parseStorageUrn(urn: string) {
        const index1 = urn.lastIndexOf(':');
        const subPath = urn.substr(index1);
        const index2 = subPath.lastIndexOf('/');

        return {
            bucket: subPath.substr(1, index2 - 1),
            objectName: subPath.substr(index2 + 1)
        };
    }
}
