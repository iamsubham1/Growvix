import 'reflect-metadata';

import * as express from 'express';
import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import { connectToDb } from './configuration/db';
import * as cors from 'cors';
import { UserRoutes } from './routes/userRoutes';
import { AdminRoutes } from './routes/adminRoutes';
import { PaymentRoutes } from './routes/paymentRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const MONGODB_URL: string = process.env.MONGODB_URL || '';

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(cors({}));

const startServer = async () => {
    await connectToDb(MONGODB_URL);

    app.use('/api/user', UserRoutes);
    app.use('/api/admin', AdminRoutes);
    app.use('/api/payment', PaymentRoutes);

    app.get('/health', (req: Request, res: Response) => {
        res.send('server is up');
    });

    app.all('*', (req: Request, res: Response) => {
        res.status(404).json({
            message: `Path '${req.path}' does not exist`,
        });
    });
    app.listen(PORT, () => {
        console.log(`app is listening on port ${PORT}`);
    });
};

startServer();

export default app;
