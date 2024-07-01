import * as mongoose from 'mongoose';

export interface ResetPasswordModel extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
    otp: string;
    expireAt: Date;
    attempt: number;

}

const resetPasswordSchema = new mongoose.Schema<ResetPasswordModel>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference the 'Admin' model
        },

        otp: { type: String },
        expireAt: { type: Date },
        attempt: { type: Number }
    },
    {
        collection: 'resetpassword',
        timestamps: true,
    },
);

export const ResetPasswordSchema = mongoose.model<ResetPasswordModel>('ResetPassword', resetPasswordSchema);
