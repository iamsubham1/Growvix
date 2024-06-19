import * as jwt from 'jsonwebtoken';
import { msg } from '../helper/messages';
import * as argon2 from 'argon2';
import { responseStatus } from '../helper/responses';
import { Request, Response } from 'express';
import { Inject, Service } from 'typedi';
import { jwtSignIN, jwtPayload } from '../configuration/config';
import * as dotenv from 'dotenv';
dotenv.config();
import { AdminRepository } from '../repository/adminRepository';
import { BusinessCategoryRepository } from '../repository/categoryRepository';
import { AdminModel } from '../models/adminModel';
import { userObjectCleanUp } from '../helper/utils';

@Service()
export class AdminService {
    constructor(@Inject() private adminRepository: AdminRepository) {}

    save = async (req: Request, res: Response) => {
        try {
            const user: AdminModel = req.body;
            if (!user.email) {
                return responseStatus(res, 400, msg.user.emailRequired, null);
            }
            const existingUser = await this.adminRepository.findByEmail(user.email);
            if (existingUser) {
                return responseStatus(res, 400, msg.user.userEmailExist, null);
            }
            if (!user.password) {
                return responseStatus(res, 400, msg.user.passwordRequired, null);
            }
            user.password = await argon2.hash(user.password);

            const newUser = await this.adminRepository.save(user);
            if (!newUser) {
                return responseStatus(res, 500, msg.user.errorInSaving, null);
            }

            const token = jwt.sign({ userId: newUser._id, role: newUser.role }, jwtSignIN.secret);
            return responseStatus(res, 200, msg.user.userSavedSuccess, {
                token: token,

                user: newUser,
            });
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };

    login = async (req: Request, res: Response) => {
        try {
            const { email, password }: AdminModel = req.body;
            const user = await this.adminRepository.findByEmail(email);
            if (!user) {
                return responseStatus(res, 401, msg.user.userNotFound, null);
            }
            const passwordMatch = await argon2.verify(user.password, password);
            if (!passwordMatch) {
                return responseStatus(res, 401, msg.user.invalidCredentials, null);
            }
            const token = jwt.sign({ userId: user._id, role: user.role }, jwtSignIN.secret);
            return responseStatus(res, 200, msg.user.loggedInSuccess, {
                token: token,
                user: userObjectCleanUp(user),
            });
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };

    updateAccount = async (req: Request & { user: any }, res: Response) => {
        try {
            const _id = req.user?.payload?.userId;
            if (!_id) {
                return responseStatus(res, 400, msg.common.invalidRequest, null);
            }
            const updateData = req.body;
            const updatedUser = await this.adminRepository.updateById(_id, updateData);
            if (!updatedUser) {
                return responseStatus(res, 404, msg.user.userNotFound, null);
            }
            return responseStatus(res, 200, msg.user.userUpdatedSuccess, updatedUser);
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };

    delete = async (req: Request & { user: any }, res: Response) => {
        try {
            //get the userId from payload added during auth middleware

            const _id = req.user?.payload?.userId;
            if (!_id) {
                return responseStatus(res, 400, msg.common.invalidRequest, null);
            }
            await this.adminRepository.deleteById(_id);
            return responseStatus(res, 200, msg.user.userDeletedSuccess, {});
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };
}
