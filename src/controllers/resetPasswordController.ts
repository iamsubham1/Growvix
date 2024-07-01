import { AdminService } from '../services/adminServices';
import { Inject, Service } from 'typedi';
import { responseStatus } from '../helper/responses';
import { msg } from '../helper/messages';
import { Request, Response } from 'express';
import { ResetPasswordService } from '../services/resetPasswordServices';



@Service()
export class ResetPasswordController {
    constructor(
        @Inject() private resetPasswordService: ResetPasswordService,

    ) { }



    resetPasswordLinkAndOtp = async (req: Request, res: Response) => {
        try {
            return await this.resetPasswordService.sendOtpAndToken(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);

        }
    };

    verifyOtp = async (req: Request, res: Response) => {
        try {
            return await this.resetPasswordService.verifyOtp(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);

        }
    };



};