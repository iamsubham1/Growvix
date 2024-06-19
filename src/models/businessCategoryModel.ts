import mongoose from 'mongoose';

export interface BusinessCategoryModel extends mongoose.Document {
    name: string;
}

const subscriptionPlanSchema = new mongoose.Schema(
    {
        name: {
            type: String,
        },
        created_at: {
            type: Date,
            default: Date.now,
        },
    },
    {
        collection: 'Business-Category',
        timestamps: true,
    },
);

export const BusinessCategorySchema = mongoose.model<BusinessCategoryModel>('BusinessCategory', subscriptionPlanSchema);
