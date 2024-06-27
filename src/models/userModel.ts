import * as mongoose from 'mongoose';

// Define common interfaces

export interface Address {
    street: string;
    city: string;
    state: string;
}

export interface TokenInfo {
    facebook?: string;
    instagram?: string;
    google?: string;
    linkedin?: string;
    reddit?: string;
}

export interface SocialMediaInfo {
    youtube?: {
        channelId: string;
        title: string;
        description: string;
        thumbnail: string;
        subscribers: number;
    };
    instagram?: {
        username: string;
        id: string;
        account_type: string;
        media_count: number;
    };
    facebook?: {
        userId: string;
        name: string;
        email: string;
        profilePicture: string;
        friendsCount: number;
        pages: any[];
        groups: any[];
    };
}


export interface AdminModel extends mongoose.Document {
    role: 'ADMIN' | 'EMPLOYEE';
    businessList: mongoose.Types.ObjectId[];
    picture: string;
}

export interface CreatorModel extends mongoose.Document {
    phoneNumber: string;
    avatar: string;
    address: Address;
    creatorType: 'Influencer' | 'Editor' | 'Videographer';
    longitude?: number;
    latitude?: number;
    instagramLink: string;
    youtubeLink: string;
    facebookLink?: string;
    skills?: string[];
}

export interface BusinessModel extends mongoose.Document {
    phoneNumber: string;
    businessName: string;
    businessCategory: mongoose.Types.ObjectId;
    instagramLink: string;
    youtubeLink: string;
    subscription: mongoose.Types.ObjectId;
    picture: string;
    google_id: string;
    verified_email: string;
    longitude?: number;
    latitude?: number;
    tokens?: TokenInfo;
    socialMedia?: SocialMediaInfo;
}


const addressSchema = new mongoose.Schema<Address>({
    street: { type: String },
    city: { type: String },
    state: { type: String },
});

const businessSchema = new mongoose.Schema<BusinessModel>(
    {
        businessName: { type: String },
        businessCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessCategory' },
        instagramLink: { type: String },
        youtubeLink: { type: String },
        subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan' },
        google_id: { type: String },
        verified_email: { type: String },
        longitude: { type: Number },
        latitude: { type: Number },
        tokens: {
            facebook: { type: String },
            instagram: { type: String },
            google: { type: String },
            linkedin: { type: String },
            reddit: { type: String },
        },
        socialMedia: {
            youtube: {
                channelId: { type: String },
                title: { type: String },
                description: { type: String },
                thumbnail: { type: String },
                subscribers: { type: Number },
            },
            instagram: {
                username: { type: String },
                id: { type: String },
                account_type: { type: String },
                media_count: { type: Number },
            },
            facebook: {
                userId: { type: String },
                name: { type: String },
                email: { type: String },
                profilePicture: { type: String },
                friendsCount: { type: Number },
                pages: { type: [mongoose.Schema.Types.Mixed] },
                groups: { type: [mongoose.Schema.Types.Mixed] },
            },
        },
    },
    { timestamps: true }
);

const creatorSchema = new mongoose.Schema<CreatorModel>(
    {
        address: { type: addressSchema },
        creatorType: { type: String, enum: ['Influencer', 'Editor', 'Videographer'] },
        longitude: { type: Number },
        latitude: { type: Number },
        instagramLink: { type: String },
        youtubeLink: { type: String },
        facebookLink: { type: String },
        skills: { type: [String] },
    },
    { timestamps: true }
);

const adminSchema = new mongoose.Schema<AdminModel>(
    {
        role: { type: String, enum: ['ADMIN', 'EMPLOYEE'] },
        businessList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    { timestamps: true }
);


export interface UserModel extends mongoose.Document {
    type: 'Admin' | 'Business' | 'Creator';
    _id: mongoose.Schema.Types.ObjectId;
    name: string;
    email: string;
    password: string;
    isDeleted: boolean;
    phoneNumber: string;
    picture?: string;
    status: string;
    admin?: AdminModel;
    business?: BusinessModel;
    creator?: CreatorModel;
}


const userSchema = new mongoose.Schema<UserModel>(
    {
        type: {
            type: String,
            enum: ['Admin', 'Business', 'Creator'],
        },
        name: { type: String },
        email: { type: String, unique: true },
        password: { type: String },
        isDeleted: { type: Boolean },
        status: { type: String },
        phoneNumber: { type: String, unique: true, sparse: true },
        admin: adminSchema,
        business: businessSchema,
        creator: creatorSchema,
        picture: { type: String }
    },
    { collection: 'USERS', timestamps: true }
);






export const UserSchema = mongoose.model<UserModel>('User', userSchema);
