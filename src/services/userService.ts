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
import { Model, Document } from 'mongoose';

dotenv.config();
import { UserModel, UserSchema } from '../models/userModel';
import sendEmailWithPassword from '../helper/sendMail';
import uploadImage from '../helper/uploadImage'; // Import the uploadImage function from your helper
const UserSchema: Model<UserModel & Document> = require('../models/userModel').model;

@Service()
export class UserService {
    constructor(@Inject() private userRepository: UserRepository) { }

    private generatePassword(): string {
        const randomNumber = Math.floor(Math.random() * 10000);
        return `GrowVix@sicdigit${randomNumber}`;
    }

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

            // Generate and hash password
            const generatedPassword = this.generatePassword();
            console.log(generatedPassword);
            user.password = await argon2.hash(generatedPassword);
            user.isDeleted = false;

            const newUser = await this.userRepository.save(user);
            if (!newUser) {
                return responseStatus(res, 500, msg.user.errorInSaving, null);
            }
            // Send email with the auto-generated password
            await sendEmailWithPassword(newUser.email, generatedPassword);

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

    //soft delete
    delete = async (req: Request & { user: any }, res: Response) => {
        try {
            const _id = req.params.id
            if (!_id) {
                return responseStatus(res, 400, msg.common.invalidRequest, null);
            }
            await this.userRepository.softDeleteById(_id);
            return responseStatus(res, 200, msg.user.userDeletedSuccess, {});
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };

    findUserByEmail = async (req: Request & { user: any }, res: Response) => {
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

    findUserById = async (req: Request & { user: any }, res: Response) => {
        try {
            const userId = req.params.id;

            const user = await this.userRepository.findById(userId);
            if (user.isDeleted == false) {
                return responseStatus(res, 200, msg.user.userFound, user);
            }
            return responseStatus(res, 200, msg.user.userNotExist, false);
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

    getAllUsers = async (req: Request, res: Response) => {
        try {
            const allUsers = await this.userRepository.findAll({ isDeleted: false });
            console.log(allUsers);
            return responseStatus(res, 200, msg.user.fetchedSuccessfully, allUsers);
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.user.fetchFailed, 'An unknown error occurred');
        }
    }

    updateBusinessStatus = async (req: Request, res: Response) => {
        try {
            const _id = req.params.id;
            const { status } = req.body;
            console.log(status);

            if (!_id || typeof status !== 'string') {
                return responseStatus(res, 400, msg.common.invalidRequest, null);
            }

            const updatedUser = await this.userRepository.updateBusinessStatusId(_id, status);

            if (!updatedUser) {
                return responseStatus(res, 404, msg.user.userNotExist, null);
            }

            return responseStatus(res, 200, 'status updated successfully', updatedUser);
        } catch (error) {
            console.error("Error updating business status:", error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };

    uploadUserProfileImage = async (req: Request, res: Response) => {
        try {

            const userId = req.params.id;

            if (!userId) {
                console.log("Invalid userId, sending 400 response...");
                return responseStatus(res, 400, msg.common.invalidRequest, null);
            }

            const secure_url = await uploadImage(req, res);
            console.log("secureurl:", secure_url);

            // Respond with the secure_url upon successful upload
            return responseStatus(res, 200, 'Uploaded successfully', secure_url);
        } catch (error) {
            if (error.statusCode) {
                return responseStatus(res, error.statusCode, error.message, null);
            }
            console.error('Error uploading profile image:', error);
            console.log("Sending 500 response due to error...");
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };
}
