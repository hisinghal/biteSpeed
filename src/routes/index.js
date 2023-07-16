import { Router } from 'express';
import contactRoute from './contactIdentify.js';

const routes = Router();

routes.get('/', async (req, res) => {
	res.setHeader('content-type', 'text/json');
	res.send(JSON.stringify('code is working'));
});


routes.use('/', contactRoute);


export default routes;
