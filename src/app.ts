import { Hono } from 'hono';

import { handleDetails } from './handler';

const app = new Hono();

app.get('/', ctx => ctx.text('Why are you here?'));

// get manga details
app.post('/details', async ctx => handleDetails(ctx));

export default app;
