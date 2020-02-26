import { AuthService } from 'services/authService';
import { ProjectService } from 'services/projectService';

export class AppController {
    private _authService: AuthService;
    private _projectService: ProjectService;
    private _btnLogin: JQuery;
    private _loginContainer: JQuery;
    private _projectContainer: JQuery;
    private _username: JQuery;
    private _userProfile: any;

    constructor() {
    }

    public initialize(): void {
        this._authService = new AuthService();
        this._projectService = new ProjectService();
        this._btnLogin = $('#login-btn');
        this._btnLogin.on('click', () => {
            this.onLoginClick();
        });
        this._loginContainer = $('#login-container');
        this._projectContainer = $('#project-container')
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
        this._username.text();
    }

    private async showProjectView(): Promise<void> {
        this._loginContainer.toggleClass('hidden', true);
        this._projectContainer.toggleClass('hidden', false);
        this._username.text(this._userProfile.userName);
        // fetch list of available projects
        this._projectContainer.empty();
        const projects = await this._projectService.getProjects();

        projects.forEach((p) => {
            this._projectContainer.append(
                $('<div/>')
                    .text(`${p.name}`)
            );
        });
    }

    private onLoginClick(): void {
        this._authService.authenticate().then((data) => {
            window.location.assign(data.url);
        });
    }
}
