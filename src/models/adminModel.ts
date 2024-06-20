import * as mongoose from 'mongoose';

export interface AdminModel extends mongoose.Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password: string;
    role: string;
    businessList: String[];
}

const adminSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
        },
        role: {
            type: String,
            enum: ['ADMIN', 'SUBADMIN'],
        },
        businessList: {
            type: [String]
        }
    },
    {
        collection: 'admin',
        timestamps: true,
    },
);

export const AdminSchema = mongoose.model<AdminModel>('Admin', adminSchema);
