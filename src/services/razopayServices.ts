import { Inject, Service } from 'typedi';
import { responseStatus } from '../helper/responses';
import { msg } from '../helper/messages';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
const Razorpay = require('razorpay');
import * as CryptoJS from 'crypto-js';
import * as dotenv from 'dotenv';
import { SubscriptionPlanModel, ISubscriptionPlan } from '../models/subcriptionModel';
import { BillingTypeSchema } from '../models/billingTypeModel';
import { PlanSchema } from '../models/plansModel';
import { UserModel, UserSchema } from '../models/userModel';
import { UserRepository } from '../repository/userRepository';
import mongoose from 'mongoose';
import * as jwt from 'jsonwebtoken';
dotenv.config();

const key_id = process.env.RAZERPAY_KEY_ID!;
const key_secret = process.env.RAZERPAY_KEY_SECRET!;

const razorpayInstance = new Razorpay({
    key_id: key_id,
    key_secret: key_secret,
});

@Service()
export class RazorpayService {
    constructor(@Inject() private userRepository: UserRepository) { }

    async createOrder(req: Request, res: Response) {
        const receiptId = uuidv4();
        const options = {
            amount: req.body.amount * 100,
            currency: req.body.currency,
            receipt: receiptId,
            payment_capture: 1,
        };

        try {
            const response = await razorpayInstance.orders.create(options);
            res.json({
                order_id: response.id,
                currency: response.currency,
                amount: response.amount,
                receipt: receiptId,
            });
        } catch (err) {
            console.error('Error creating Razorpay order:', err);
            res.status(400).send('Not able to create order. Please try again!');
        }
    }

    async verifyPaymentSignature(req: Request & { user: any }, res: Response) {
        try {
            const encryptedRequestBody = req.body.encryptedData;
            const decryptedBody = this.decryptData(encryptedRequestBody);

            const { order_id, payment_id, razorpay_signature, planId, billingTypeId, userId } = decryptedBody;

            if (!order_id || !payment_id || !razorpay_signature || !planId || !billingTypeId || !userId) {
                console.error('Missing parameters in request body');
                return responseStatus(res, 400, 'Missing parameters', { code: 'MISSING_PARAMETERS' });
            }

            const text = order_id + '|' + payment_id;
            const expectedSignature = CryptoJS.HmacSHA256(text, key_secret).toString(CryptoJS.enc.Hex);

            if (expectedSignature === razorpay_signature) {
                const token = req.headers.authorization?.split(' ')[1];
                if (!token) {
                    return responseStatus(res, 401, 'Authorization token is missing', { code: 'UNAUTHORIZED' });
                }


                const billingType = await BillingTypeSchema.findById(billingTypeId);
                if (!billingType) {
                    return responseStatus(res, 400, 'Invalid billing type', { code: 'INVALID_BILLING_TYPE' });
                }

                const plan = await PlanSchema.findById(planId);
                if (!plan) {
                    return responseStatus(res, 400, 'Invalid plan', { code: 'INVALID_PLAN' });
                }

                const price = plan.price;
                const durationInDays = billingType.duration;
                const startDate = new Date();
                const endDate = new Date(startDate.getTime() + durationInDays * 24 * 60 * 60 * 1000);

                const newSubscription = new SubscriptionPlanModel({
                    userId: userId,
                    plan: planId,
                    billingType: billingTypeId,
                    price: price,
                    startDate: startDate,
                    endDate: endDate,
                    status: 'active',
                    transactionId: payment_id,
                    paymentId: payment_id,
                    orderId: order_id,
                    signature: razorpay_signature,
                });

                try {
                    const savedSubscription = await newSubscription.save();

                   
                    console.log(savedSubscription._id, "savedSubscription._id")
                    await UserSchema.findByIdAndUpdate(userId, { subscription: savedSubscription._id });

                    return responseStatus(res, 200, msg.payment.success, { code: 'PAYMENT_SUCCESS' });
                } catch (error) {
                    console.error('Failed to update subscription:', error);
                    return responseStatus(res, 500, msg.common.somethingWentWrong, { code: 'SERVER_ERROR' });
                }
            } else {
                return responseStatus(res, 400, msg.payment.failed, { code: 'NOT_SUCCESS' });
            }
        } catch (error) {
            console.error('Error verifying payment signature:', error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, { code: 'SERVER_ERROR' });
        }
    }

    private encryptData(data: any) {
        const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), key_secret).toString();
        return encryptedData;
    }

    private decryptData(encryptedData: string) {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedData, key_secret);
            const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
            if (!decryptedText) {
                throw new Error('Decrypted text is empty');
            }
            const decryptedData = JSON.parse(decryptedText);
            return decryptedData;
        } catch (error) {
            throw new Error('Decryption failed');
        }
    }
}
