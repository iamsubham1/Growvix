import { Inject, Service } from 'typedi';
import { responseStatus } from '../helper/responses';
import { msg } from '../helper/messages';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
const Razorpay = require('razorpay');
import * as dotenv from 'dotenv';
import { RazorpayService } from '../services/razopayServices';
dotenv.config();

const key_id = process.env.RAZERPAY_KEY_ID!;
const key_secret = process.env.RAZERPAY_KEY_SECRET!;

const razorpayInstance = new Razorpay({
    key_id: key_id,
    key_secret: key_secret,
});

@Service()
class PaymentController {
    constructor(@Inject() private razorpayService: RazorpayService) {}

    createOrder = async (req: Request, res: Response) => {
        try {
            return await this.razorpayService.createOrder(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

    verifyPaymentSignature = async (req: Request& { user: any }, res: Response) => {
        try {
            return await this.razorpayService.verifyPaymentSignature(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };
}

export { PaymentController };
