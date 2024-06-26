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
    password: string;
    avatar: string;
    address: Address;
    status: string;
    creatorType: string;
    longitude?: number;
    latitude?: number;
    isDeleted: boolean;
    instagramLink: string;
    youtubeLink: string;
    facebookLink?: string;
    skills?: string[];

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

const creatorSchema = new mongoose.Schema<CreatorModel>(
    {
        name: {
            type: String,
        },
        email: {
            type: String,
        },
        password: { type: String },

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
            type: String,
            enum: ['ACTIVE', 'SUSPENDED']
        },

        creatorType: {
            type: String,
            enum: ['Influencer', 'Editor', 'Videographer'],
        },
        longitude: { type: Number },
        latitude: { type: Number },
        isDeleted: { type: Boolean },
        instagramLink: { type: String },
        facebookLink: { type: String },
        youtubeLink: { type: String },
        skills: { type: [String] }
    },
    {
        collection: 'creators',
        timestamps: true,
    },
);

export const CreatorSchema = mongoose.model<CreatorModel>('Creator', creatorSchema);

