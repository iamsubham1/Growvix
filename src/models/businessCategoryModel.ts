import * as mongoose from 'mongoose';

export interface BusinessCategoryModel extends mongoose.Document {
    name: string;
}

const businessCategorySchema = new mongoose.Schema<BusinessCategoryModel>(
    {
        name: {
            type: String,
        },

    },
    {
        collection: 'Business-Category',
        timestamps: true,
    },
);

export const BusinessCategorySchema = mongoose.model<BusinessCategoryModel>('BusinessCategory', businessCategorySchema);
