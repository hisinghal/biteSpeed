import express from 'express';
import routes from './routes/index.js';
import bodyParser from 'body-parser';
const app = express();


app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: false, parameterLimit: 20000 }));

app.use('/', routes);

app.use((req, res, next) => {
	const err = new Error('Not Found');
	err.status = 404;
	next(err);
});


export default app;
