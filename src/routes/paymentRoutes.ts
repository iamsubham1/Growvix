import { Router } from 'express';
import { Container } from 'typedi';
import { PaymentController } from '../controllers/razerPayController';

const router = Router();
const paymentController = Container.get(PaymentController);

router.post('/createorder', paymentController.createOrder);
router.post('/verifyPayment',  paymentController.verifyPaymentSignature);

export { router as PaymentRoutes };
