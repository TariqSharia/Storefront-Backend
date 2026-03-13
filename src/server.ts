import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import userRoutes from './handlers/users';
import productRoutes from './handlers/products';
import orderRoutes from './handlers/orders';

dotenv.config();
const app: express.Application = express();
const address: string = "0.0.0.0";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

userRoutes(app);
productRoutes(app);
orderRoutes(app);

app.get('/', function (req: Request, res: Response) {
    res.send('The application is up and running!');
});

app.listen(parseInt(process.env.PORT || '3000'), function () {
    console.log(`starting app on: ${address}:${process.env.PORT || 3000}`);
});

export default app;
