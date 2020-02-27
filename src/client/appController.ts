import { AuthService } from 'services/authService';
import { ProjectService } from 'services/projectService';

export class AppController {
    private _authService: AuthService;
    private _projectService: ProjectService;
    private _btnLogin: JQuery;
    private _btnProjectSelect: JQuery;
    private _btnFileSelect: JQuery;
    private _loginContainer: JQuery;
    private _projectContainer: JQuery;
    private _projectList: JQuery;
    private _fileContainer: JQuery;
    private _fileList: JQuery;
    private _username: JQuery;
    private _userProfile: any;
    private _selectedProject: string;

    constructor() {
    }

    public initialize(): void {
        this._authService = new AuthService();
        this._projectService = new ProjectService();
        this._btnLogin = $('#login-btn');
        this._btnLogin.on('click', () => {
            this.onLoginClick();
        });
        this._btnProjectSelect = $('#project-select-btn');
        this._btnProjectSelect.on('click', () => {
            this.onProjectSelectClick();
        });
        this._btnFileSelect = $('#file-select-btn');
        this._btnFileSelect.on('click', () => {
            this.onFileSelectClick();
        });
        this._loginContainer = $('#login-container');
        this._projectContainer = $('#project-container');
        this._projectList = $('#project-list');
        this._projectList.on('click', (e) => {
            this.onProjectListClick(e);
        });
        this._fileContainer = $('#file-container');
        this._fileList = $('#file-list');
        this._username = $('#username')
        this._authService.getUserProfile().then((userProfile) => {
            this._userProfile = userProfile;
            this.showProjectView();
        }).catch((err) => {
            this.showLoginView();
        })
    }

    private showLoginView(): void {
        this._loginContainer.toggleClass('hidden', false);
        this._projectContainer.toggleClass('hidden', true);
        this._fileContainer.toggleClass('hidden', true);
        this._username.text();
    }

    private async showProjectView(): Promise<void> {
        this._loginContainer.toggleClass('hidden', true);
        this._projectContainer.toggleClass('hidden', false);
        this._fileContainer.toggleClass('hidden', true);
        this._username.text(this._userProfile.userName);
        // fetch list of available projects
        this._projectList.empty();
        const projects = await this._projectService.getProjects();

        projects.forEach((p) => {
            const div = $(`
                <div class="project-item" data-project="${p.id}">
                    <span>${p.name}</span>
                </div>`);

            this._projectList.append(div);
        });
    }

    private onLoginClick(): void {
        this._authService.authenticate().then((data) => {
            window.location.assign(data.url);
        });
    }

    private onProjectListClick(e): void {
        const target = $(e.target);
        const projectItem = target.parent();
        
        this._projectList.children().toggleClass('selected', false);
        projectItem.toggleClass('selected', true);
    }

    private async onFileSelectClick(): Promise<void> {
        const files = (this._fileList[0] as HTMLInputElement).files;
        const input = {
            project: this._selectedProject,
            files: []
        };

        for (let i = 0; i < files.length; i++) {
            const file = files.item(i);

            input.files.push({
                name: file.name
            });
        }
        const response = await this._projectService.createPackage(input);
        // upload file to provided storage
        const formData = new FormData();

        formData.append('file', files.item(0));
        formData.append('folder', response.locations[0].folder);
        formData.append('name', files.item(0).name);
        formData.append('project', this._selectedProject);
        formData.append('storage', response.locations[0].storage);
        const uploadResult = await this._projectService.uploadFile(formData);

        console.debug(`${uploadResult}`);
    }

    private onProjectSelectClick(): void {
        // find selected project
        const projectElement = $('#project-list div.selected');

        if (projectElement.length === 0) {
            return;
        }
        this._selectedProject = projectElement.data('project');
        // switch view
        this._loginContainer.toggleClass('hidden', true);
        this._projectContainer.toggleClass('hidden', true);
        this._fileContainer.toggleClass('hidden', false);
    }
}
