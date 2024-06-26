import * as mongoose from 'mongoose';

export interface PlanModel extends mongoose.Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    price: number;
    features: string[];
    billingType: mongoose.Types.ObjectId;
    description: string;
}

const planSchema = new mongoose.Schema<PlanModel>(
    {
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
        },

        features: {
            type: [String],
            required: true,
        },

        billingType: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'BillingType',
        },
    },

    {
        collection: 'plans',
        timestamps: true,
    },
);

export const PlanSchema = mongoose.model<PlanModel>('Plan', planSchema);
