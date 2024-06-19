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
    profilePicture: string;
    address: Address;
    socialMediaLink: string;
    status: boolean;
    subscription: string;
    creatorType: string;
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
        profilePicture: {
            type: String,
        },
        address: {
            type: addressSchema,
        },
        socialMediaLink: {
            type: String,
        },
        status: {
            type: Boolean,
        },
        creatorType: {
            type: String,
            enum: ['Influencer', 'Editor', 'Videographer'],
        },

    },
    {
        collection: 'creators',
        timestamps: true,
    },
);

const Creator = mongoose.model<CreatorModel>('Creator', creatorSchema);

export default Creator;
