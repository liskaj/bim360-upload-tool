export class AppController {
    private _btnLogin: JQuery;
    private _loginContainer: JQuery;
    private _projectContainer: JQuery;

    constructor() {
    }

    public initialize(): void {
        this._btnLogin = $('#login-btn');
        this._btnLogin.on('click', () => {
            this.onLoginClick();
        });
        this._loginContainer = $('#login-container');
        this._projectContainer = $('#project-container')
    }

    private onLoginClick(): void {
        this._loginContainer.toggleClass('hidden', true);
        this._projectContainer.toggleClass('hidden', false);
    }
}
