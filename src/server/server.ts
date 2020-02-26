import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as session from 'express-session';
import * as path from 'path';

import { AuthService } from './authService';

const app = express();

app.use(session({
    secret: 'Snq1KzV$c!',
    cookie: {
        path: '/',
        httpOnly: true,
        maxAge: 14 * 24 * 60 * 60 * 10 // refresh token has lifetime 14 days
    },
    name: 'ecp',
    resave: true,
    saveUninitialized: true

}))

app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));
app.use(bodyParser.json({ limit: '1mb' }));
// set path for static content
const staticPath = path.normalize(`${__dirname}/../app`);

app.use('/', express.static(staticPath));
// set options
const options = {
    clientID: process.env.FORGE_CLIENT_ID,
    clientSecret: process.env.FORGE_CLIENT_SECRET,
    callbackURL: process.env.FORGE_CALLBACK_URL,
    useProxy: process.env.USE_PROXY === '1'
};

// services
const authSvc = new AuthService(options);

app.use('/api/services/auth', authSvc.router);
// listen on given port
const port = process.env.PORT || 3000;

app.set('port', port);
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
