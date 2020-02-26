import { ServiceClient } from './serviceClient';

export interface Project {
    id: string;
    name: string;
}

export class ProjectService extends ServiceClient {
    public getProjects(): Promise<Project[]> {
        const url = `api/project/projects`;

        return this.get(url);
    }
}
