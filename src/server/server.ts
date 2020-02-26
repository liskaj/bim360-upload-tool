import * as express from 'express';
import * as bodyParser from 'body-parser';

const app = express();

app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));
app.use(bodyParser.json({ limit: '1mb' }));
app.use('/', express.static(`${__dirname}/../../app`));

// listen on given port
const port = process.env.PORT || 3000;

app.set('port', port);
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
