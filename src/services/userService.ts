import * as jwt from 'jsonwebtoken';
import { msg } from '../helper/messages';
import * as argon2 from 'argon2';
import { responseStatus } from '../helper/responses';
import { Request, Response } from 'express';
import { UserRepository } from '../repository/userRepository';
import { Inject, Service } from 'typedi';
import { jwtSignIN } from '../configuration/config';
import { userObjectCleanUp } from '../helper/utils';
import * as dotenv from 'dotenv';
dotenv.config();
import { UserModel, UserSchema } from '../models/userModel';

@Service()
export class UserService {
    constructor(@Inject() private userRepository: UserRepository) { }

    save = async (req: Request, res: Response) => {
        try {
            const user: UserModel = req.body;
            if (!user.email && !user.phoneNumber) {
                return responseStatus(res, 400, msg.user.userEmailAndPhoneNumberNotExist, null);
            }
            if (user.email) {
                const existingUserByEmail = await this.userRepository.findByEmail(user.email);
                if (existingUserByEmail) {
                    return responseStatus(res, 400, msg.user.userEmailExist, null);
                }
            }
            if (user.phoneNumber) {
                const existingUserByPhoneNumber = await this.userRepository.findByPhoneNumber(user.phoneNumber.toString());
                if (existingUserByPhoneNumber) {
                    return responseStatus(res, 400, msg.user.userPhoneNumberExist, null);
                }
            }
            console.log(user?.password)
            user.password = await argon2.hash(user?.password);
            console.log(user?.password)
            const newUser = await this.userRepository.save(user);
            if (!newUser) {
                return responseStatus(res, 500, msg.user.errorInSaving, null);
            }
            const token = jwt.sign({ userId: newUser._id }, jwtSignIN.secret);
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
            const { emailOrPhoneNumber, password }: { emailOrPhoneNumber: string; password: string } = req.body;

            let user = await this.userRepository.findByEmail(emailOrPhoneNumber);

            if (!user) {
                const isPhoneNumber = /^\d+$/.test(emailOrPhoneNumber);
                if (isPhoneNumber) {
                    user = await this.userRepository.findByPhoneNumber(emailOrPhoneNumber);
                } else {
                    return responseStatus(res, 400, msg.user.userNotFound, null);
                }
            }

            if (!user) {
                return responseStatus(res, 400, msg.user.userNotFound, null);
            }

            const passwordMatch = await argon2.verify(user.password, password);
            if (!passwordMatch) {
                return responseStatus(res, 401, msg.user.invalidCredentials, null);
            }

            const token = jwt.sign({ userId: user._id }, jwtSignIN.secret);

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
            console.log()
            const _id = req.user?.payload?.userId;
            if (!_id) {
                return responseStatus(res, 400, msg.common.invalidRequest, null);
            }
            const updateData = req.body;
            if (updateData.phoneNumber) {
                const existingUserByPhoneNumber = await this.userRepository.findByPhoneNumber(updateData.phoneNumber.toString());
                if (existingUserByPhoneNumber && existingUserByPhoneNumber._id.toString() !== _id) {
                    return responseStatus(res, 400, msg.user.userPhoneNumberExist, null);
                }
            }
            const updatedUser = await this.userRepository.updateById(_id, updateData);
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
            const _id = req.user?.payload?.userId;
            if (!_id) {
                return responseStatus(res, 400, msg.common.invalidRequest, null);
            }
            await this.userRepository.deleteById(_id);
            return responseStatus(res, 200, msg.user.userDeletedSuccess, {});
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };

    findUser = async (req: Request & { user: any }, res: Response) => {
        try {
            const email = req.body.email;
            if (!email) {
                return responseStatus(res, 400, msg.common.emptyBody, null);
            }
            const user = await this.userRepository.findByEmail(email);
            if (user) {
                return responseStatus(res, 200, msg.user.userEmailExist, true);
            }
            return responseStatus(res, 200, msg.user.userEmailNotExist, false);
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };

    async findOrCreateUser(profile: any): Promise<{ existingUser: boolean; user: UserModel | null; token: string | null }> {
        let user = await this.userRepository.findByEmail(profile.email);

        if (!user) {
            user = new UserSchema({
                email: profile?.email,
                name: profile?.name,
                google_id: profile?.id,
                verified_email: profile?.verified_email,
                avatar: profile?.picture,
            });

            user = await this.userRepository.save(user);

            // Generate JWT token for the new user
            const token = jwt.sign({ userId: user._id }, jwtSignIN.secret);
            return { existingUser: false, user, token };
        }

        // Populate related data for existing user
        user = await UserSchema.findById(user._id).populate('subscription').populate('businessCategory').exec();

        // Generate JWT token for the existing user
        const token = jwt.sign({ userId: user._id }, jwtSignIN.secret);

        return { existingUser: true, user, token };
    }
}
