import * as mongoose from 'mongoose';

export interface BillingTypeModel extends mongoose.Document {
    name: string;
    duration: number; // duration in days
}

const billingTypeSchema = new mongoose.Schema<BillingTypeModel>(
    {
        name: {
            type: String,
            required: true,
        },
        duration: {
            type: Number,
            required: true,
            default: 30, // default duration is 30 days (1 month)
        },
    },
    {
        collection: 'billingTypes',
        timestamps: true,
    },
);

export const BillingTypeSchema = mongoose.model<BillingTypeModel>('BillingType', billingTypeSchema);

// 1 month: 30 days
// 3 months: 90 days
// 6 months: 180 days
// 1 year: 365 days
