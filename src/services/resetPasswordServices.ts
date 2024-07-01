import * as jwt from 'jsonwebtoken';
import { msg } from '../helper/messages';
import * as argon2 from 'argon2';
import { responseStatus } from '../helper/responses';
import { Request, Response } from 'express';
import { Inject, Service } from 'typedi';
import { jwtSignIN } from '../configuration/config';
import * as dotenv from 'dotenv';
dotenv.config();
import { MainRepository } from '../repository/mainRepository';
import { ResetPasswordRepository } from '../repository/resetPasswordRepository';
import { ResetPasswordSchema } from "../models/resetPasswordModel";
import { timingSafeEqual } from 'crypto';
import { sendEmailWithOTP } from '../helper/sendMail';



@Service()
export class ResetPasswordService {
    constructor(@Inject() private mainRepository: MainRepository,
        private resetPasswordRepository: ResetPasswordRepository) { }


    private generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    sendOtpAndToken = async (req: Request, res: Response) => {
        try {
            const { email } = req.body;
            if (!email) {
                return responseStatus(res, 400, msg.user.emailRequired, null);
            };

            const user = await this.mainRepository.findByEmail({ email: email });
            if (!user) {
                return responseStatus(res, 400, msg.user.forgotPwdError, null);
            };

            const token = jwt.sign({ userId: user._id }, jwtSignIN.secret);
            const resetLink = `${process.env.BASE_URL}/resetPassword?token=${token}`;
            const OTP = this.generateOTP();

            const data = {
                userId: user._id,
                otp: OTP,
                expireAt: new Date(Date.now() + 6 * 60 * 1000), // 6 minutes from now
                attempt: 0
            };

            const resetData = new ResetPasswordSchema(data);
            const savedOtp = await this.resetPasswordRepository.save(resetData);

            if (!savedOtp) {
                return responseStatus(res, 500, msg.user.otpSaveFailed, null);
            };

            const emailSent = await sendEmailWithOTP(user.email, OTP, resetLink);

            if (!emailSent) {
                return responseStatus(res, 500, msg.user.otpFailed, null);
            };

            return responseStatus(res, 200, msg.user.passwordResetEmailSent, null);
        } catch (error) {
            console.error('Error Sending OTP:', error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };

    verifyOtp = async (req: Request, res: Response) => {
        try {
            const { token, otp, newPassword } = req.body;

            const decoded = jwt.verify(token, jwtSignIN.secret);
            const userId = decoded.userId;

            if (!otp || !newPassword) {
                return responseStatus(res, 400, msg.user.otpAndPasswordNotFound, null);
            };

            const otpData = await this.resetPasswordRepository.findOne({ userId: userId });

            if (!otpData) {
                return responseStatus(res, 400, msg.user.otpNotFound, null);
            };

            // Increment the attempt count
            otpData.attempt += 1;
            await otpData.save();

            if (otpData.attempt > 3) {
                await this.resetPasswordRepository.delete({ userId: userId });
                return responseStatus(res, 400, msg.user.otpAttemptExceeded, null);
            };

            if (otpData.expireAt < new Date()) {
                await this.resetPasswordRepository.delete({ userId: userId });
                return responseStatus(res, 400, msg.user.otpExpired, null);
            };

            //better way to check to prevent timing-guess attacks
            if (!timingSafeEqual(Buffer.from(otpData.otp), Buffer.from(otp))) {
                return responseStatus(res, 400, msg.user.invalidOtp, null);
            };
            const hashedNewPassword = await argon2.hash(newPassword);

            const userData = await this.mainRepository.updateById(userId, { password: hashedNewPassword });

            userData.password = null;

            await this.resetPasswordRepository.delete({ userId: userId });

            return responseStatus(res, 200, msg.user.otpVerified, userData);

        } catch (error) {
            console.error('Error Verifying OTP:', error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };
}