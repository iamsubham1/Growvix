import * as mongoose from 'mongoose';

export interface ResetPasswordModel extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
}

const resetPasswordSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            ref: 'Admin',
        },
        otp: { type: Number },
        expireAt: { type: Date },
        attempt: { type: Number }
    },
    {
        collection: 'resetpassword',
        timestamps: true,
    },
);

export const ResetPassword = mongoose.model<ResetPasswordModel>('ResetPassword', resetPasswordSchema);
