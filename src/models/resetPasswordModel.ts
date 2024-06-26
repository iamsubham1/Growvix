import * as mongoose from 'mongoose';

export interface ResetPasswordModel extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
    otp: number;
    expireAt: Date;
    attempt: number;

}

const resetPasswordSchema = new mongoose.Schema<ResetPasswordModel>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin', // Reference the 'Admin' model
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
