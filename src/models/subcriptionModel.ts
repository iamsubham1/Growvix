import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscriptionPlan extends Document {
    userId: mongoose.Types.ObjectId;
    plan: mongoose.Types.ObjectId;
    billingType: mongoose.Types.ObjectId;
    price: number;
    startDate: Date;
    endDate: Date;
    status: string;
    transactionId: string;
    paymentId: string;
    orderId: string;
    signature: string;
}

const SubscriptionPlanSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    plan: { type: Schema.Types.ObjectId, required: true, ref: 'Plan' },
    billingType: { type: Schema.Types.ObjectId, required: true, ref: 'BillingType' },
    price: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, required: true },
    transactionId: { type: String, required: true },
    paymentId: { type: String, required: true },
    orderId: { type: String, required: true },
    signature: { type: String, required: true },
});

export const SubscriptionPlanModel = mongoose.model<ISubscriptionPlan>('SubscriptionPlan', SubscriptionPlanSchema);
