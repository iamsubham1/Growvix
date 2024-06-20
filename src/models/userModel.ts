import mongoose, { Document, Schema, Model } from 'mongoose';

export interface UserModel extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
    businessName: string;
    businessCategory: mongoose.Types.ObjectId;
    instagramLink: string;
    youtubeLink: string;
    subscription: mongoose.Types.ObjectId;
    picture: string;
    google_id: string;
    avatar: string;
    verified_email: string;
    facebookLink?: string;
    longitude?: number;
    latitude?: number;
    status: string;
    tokens: string;
}

const userSchema = new Schema<UserModel>(
    {
        name: { type: String },
        phoneNumber: { type: String, unique: true },
        email: { type: String, unique: true },
        password: { type: String },
        businessName: { type: String },
        businessCategory: { type: Schema.Types.ObjectId, ref: 'BusinessCategory' },
        instagramLink: { type: String },
        facebookLink: { type: String },
        youtubeLink: { type: String },
        subscription: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan' },
        verified_email: { type: String },
        picture: { type: String },
        google_id: { type: String },
        avatar: { type: String },
        longitude: { type: Number },
        latitude: { type: Number },
        tokens: {
            type: String,
            enum: ["FACEBOOK", "INSTAGRAM", "GOOGLE"]
        },
        status: {
            type: String,
            enum: ['ACTIVE', 'SUSPENDED']
        },

    },
    { collection: 'users', timestamps: true },
);

export const UserSchema: Model<UserModel> = mongoose.model<UserModel>('User', userSchema);
