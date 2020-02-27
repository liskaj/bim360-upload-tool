import { ServiceClient } from './serviceClient';

export interface Project {
    id: string;
    name: string;
}

export class ProjectService extends ServiceClient {
    public uploadFile(data: any): Promise<any> {
        const url = `api/project/upload`;

        return this.post(url, data);
    }

    public createPackage(input: any): Promise<any> {
        const url = `api/project/package`;

        return this.post(url, input);
    }

    public getProjects(): Promise<Project[]> {
        const url = `api/project/projects`;

        return this.get(url);
    }
}
