import { ServiceClient } from './serviceClient';

export interface Project {
    id: string;
    name: string;
}

export class ProjectService extends ServiceClient {
    public createImport(input: any): Promise<any> {
        const url = `api/project/import`;

        return this.post(url, input);
    }

    public getProjects(): Promise<Project[]> {
        const url = `api/project/projects`;

        return this.get(url);
    }
}
