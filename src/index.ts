import { Hono } from 'hono';
import userRouter from './Routes/user';
import placeRouter from './Routes/place';
import reviewRouter from './Routes/review'
import imageRouter from './Routes/image'

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    VALID_API_KEYS:String;
  };
}>();


app.use('*', async (c, next) => {
  c.header('Access-Control-Allow-Origin', '*'); 
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, API-Key');

  if (c.req.method === 'OPTIONS') {
    return c.text('OK', 200);
  }

  const apiKey = c.req.header('API-Key');
  if (!apiKey) {
    return c.text('API key is missing', 401);
  }

  if (c.env.VALID_API_KEYS !== apiKey) {
    return c.text('Invalid API key', 403);
  }

  await next();
});



app.route('/users', userRouter);
app.route('/places', placeRouter);
app.route('/review', reviewRouter);
app.route('/image',imageRouter);


app.get('/', (c) => c.text('Welcome to the Place Review API!'));

export default app;
