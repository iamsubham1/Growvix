import * as mongoose from 'mongoose';

export interface Address {
    street: string;
    city: string;
    state: string;
}

export interface CreatorModel extends mongoose.Document {
    name: string;
    email: string;
    phnumber: string;
    avatar: string;
    address: Address;
    status: boolean;
    subscription: string;
    creatorType: string;
    longitude?: number;
    latitude?: number;
}

const addressSchema = new mongoose.Schema({
    street: {
        type: String,
    },
    city: {
        type: String,
    },
    state: {
        type: String,
    },
});

const creatorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
        },
        email: {
            type: String,
        },
        phnumber: {
            type: String,
        },
        avatar: {
            type: String,
        },
        address: {
            type: addressSchema,
        },

        status: {
            type: Boolean,
        },
        creatorType: {
            type: String,
            enum: ['Influencer', 'Editor', 'Videographer'],
        },
        longitude: { type: Number },
        latitude: { type: Number },

    },
    {
        collection: 'creators',
        timestamps: true,
    },
);

export const Creator = mongoose.model<CreatorModel>('Creator', creatorSchema);

