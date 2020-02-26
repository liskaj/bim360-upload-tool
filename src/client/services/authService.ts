import { ServiceClient } from './serviceClient';

export class AuthService extends ServiceClient {
    public authenticate(): Promise<any> {
        const url = `api/auth/login`;

        return this.get(url);
    }

    public getUserProfile(): Promise<any> {
        const url = `api/auth/userprofile`;

        return this.get(url);
    }
}
