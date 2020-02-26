import * as express from 'express';
import * as forge from 'forge-apis';
import * as uid from 'uid-safe';

import { ServiceBase } from './serviceBase';
import { StatusCodes } from './statusCodes';

export class AuthService extends ServiceBase {
    private _scopesInternal: string[] = [
        'user-profile:read',
        'data:read',
        'data:write'
    ];
    private _scopesPublic: string[] = [
        'viewables:read'
    ];

    constructor(options: any) {
        super(options);
    }

    public getClient(internal?: boolean): forge.AuthClientThreeLegged {
        let scopes = this._scopesPublic;

        if (internal) {
            scopes = this._scopesInternal;
        }
        return new forge.AuthClientThreeLegged(this.options.clientID,
            this.options.clientSecret,
            this.options.callbackURL,
            scopes,
            true);
    }

    public async getInternalToken(req: express.Request): Promise<any> {
        if (!(req.session.internalToken && req.session.expires_at)) {
            return null;
        }
        if (this.isExpired(req.session.expires_at)) {
            await this.refreshTokens(req);
        }
        return {
            access_token: req.session.internalToken,
            expires_in: this.getExpirationTime(req.session.expires_at)
        };
    }

    protected initializeRoutes(): void {
        this.router.get('/login', (req: express.Request, res: express.Response) => {
            this.login(req, res);
        });
        this.router.get('/callback', (req: express.Request, res: express.Response) => {
            this.callback(req, res);
        });
        this.router.get('/userprofile', (req: express.Request, res: express.Response) => {
            this.getUserProfile(req, res);
        });
    }

    private async callback(req: express.Request, res: express.Response) {
        try {
            const csrf = req.query.state;

            if (csrf !== req.session.csrf) {
                return res.status(StatusCodes.Unauthorized).end();
            }
            const code: string = req.query.code;

            if (!code) {
                return res.redirect('/');
            }
            const internalClient = this.getClient(true);
            const publicClient = this.getClient(false);
            const internalCredentials = await internalClient.getToken(code);
            const publicCredentials = await publicClient.refreshToken(internalCredentials);
            const now = new Date();

            req.session.expires_at = now.setSeconds(now.getSeconds() + publicCredentials.expires_in);
            req.session.internalToken = internalCredentials.access_token;
            req.session.publicToken = publicCredentials.access_token;
            req.session.refreshToken = publicCredentials.refresh_token;
            const url = this.options.useProxy ? 'http://localhost:5000/' : '/';

            res.redirect(url);
        }
        catch (err) {
            res.status(StatusCodes.InternalServerError).json({
                error: err
            });
        }
    }

    private async login(req: express.Request, res: express.Response) {
        try {
            const client = this.getClient(true);
            const code: string = await uid(24);

            req.session.csrf = code;
            const url: string = client.generateAuthUrl(code);

            res.status(StatusCodes.OK).json({
                url: url
            });
        }
        catch (err) {
            res.status(StatusCodes.InternalServerError).json({ error: err });
        }
    }

    private async getUserProfile(req, res) {
        try {
            const userApi = new forge.UserProfileApi();
            const credentials = await this.getInternalToken(req);

            if (!credentials) {
                return res.status(StatusCodes.Unauthorized).end();
            }
            const client = this.getClient(true);
            const result = await userApi.getUserProfile(client, credentials);

            res.status(StatusCodes.OK).json(result.body);
        }
        catch (err) {
            res.status(StatusCodes.InternalServerError).json({
                error: err
            });
        }
    }

    private getExpirationTime(expiresAt: number): number {
        const now = new Date();
        const expirationDate = new Date(expiresAt);

        return Math.round((expirationDate.getTime() - now.getTime()) / 1000);
    }

    private isExpired(expiresAt: number): boolean {
        return (new Date() > new Date(expiresAt));
    }

    private async refreshTokens(req: express.Request) {
        const internalClient = this.getClient(true);
        const publicClient = this.getClient(false);
        const internalCredentials = await internalClient.refreshToken({ refresh_token: req.session.refreshToken });
        const publicCredentials = await publicClient.refreshToken(internalCredentials);
        const now = new Date();

        req.session.expires_at = now.setSeconds(now.getSeconds() + publicCredentials.expires_in);
        req.session.internalToken = internalCredentials.access_token;
        req.session.publicToken = publicCredentials.access_token;
        req.session.refreshToken = publicCredentials.refresh_token;
    }
}
