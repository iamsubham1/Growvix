import * as jwt from 'jsonwebtoken';
import { msg } from '../helper/messages';
import * as argon2 from 'argon2';
import { responseStatus } from '../helper/responses';
import { Request, Response } from 'express';
import { CreatorRepository } from '../repository/creatorRepository';
import { Inject, Service } from 'typedi';
import { jwtSignIN } from '../configuration/config';
import { CreatorModel } from '../models/creatorModel';
import * as dotenv from 'dotenv';
import sendEmailWithPassword from '../helper/sendMail';
import uploadImage from '../helper/uploadImage'; // Import the uploadImage function from your helper
import { userObjectCleanUp } from '../helper/utils';

dotenv.config();

@Service()
export class CreatorService {
    constructor(@Inject() private creatorRepository: CreatorRepository) { }

    private generatePassword(): string {
        const randomNumber = Math.floor(Math.random() * 10000);
        return `GrowVix@${randomNumber}`;
    }


    save = async (req: Request, res: Response) => {
        try {
            const creator: CreatorModel = req.body;
            if (!creator.email) {
                return responseStatus(res, 400, msg.user.emailRequired, null);
            }

            const existingCreator = await this.creatorRepository.findByEmail(creator.email);
            if (existingCreator) {
                return responseStatus(res, 400, msg.user.userEmailExist, null);
            }

            // Generate and hash password
            const generatedPassword = this.generatePassword();
            console.log(generatedPassword);
            creator.password = await argon2.hash(generatedPassword);
            creator.isDeleted = false;
            creator.status = "ACTIVE"

            // Save creator to database
            const newCreator = await this.creatorRepository.save(creator);
            if (!newCreator) {
                return responseStatus(res, 500, msg.user.errorInSaving, null);
            }

            // Send email with the auto-generated password

            await sendEmailWithPassword(creator.email, generatedPassword);



            const token = jwt.sign({ creatorId: newCreator._id }, jwtSignIN.secret);
            return responseStatus(res, 200, msg.user.userSavedSuccess, {
                token: token,
                creator: newCreator,
            });
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };

    login = async (req: Request, res: Response) => {
        try {
            const { emailOrPhoneNumber, password }: { emailOrPhoneNumber: string; password: string } = req.body;

            let user = await this.creatorRepository.findByEmail(emailOrPhoneNumber);

            if (!user) {
                const isPhoneNumber = /^\d+$/.test(emailOrPhoneNumber);
                if (isPhoneNumber) {
                    user = await this.creatorRepository.findByPhoneNumber(emailOrPhoneNumber);
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
                const existingUserByPhoneNumber = await this.creatorRepository.findByPhoneNumber(updateData.phoneNumber.toString());
                if (existingUserByPhoneNumber && existingUserByPhoneNumber._id.toString() !== _id) {
                    return responseStatus(res, 400, msg.user.userPhoneNumberExist, null);
                }
            }
            const updatedUser = await this.creatorRepository.updateById(_id, updateData);
            if (!updatedUser) {
                return responseStatus(res, 404, msg.user.userNotFound, null);
            }
            return responseStatus(res, 200, msg.user.userUpdatedSuccess, updatedUser);
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };
    getAllCreators = async (req: Request, res: Response) => {
        try {
            const allCreators = await this.creatorRepository.findAll({ isDeleted: false });
            return responseStatus(res, 200, msg.user.fetchedSuccessfully, allCreators);
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.user.fetchFailed, 'An unknown error occurred');
        }
    };

    getCreatorById = async (req: Request, res: Response) => {
        try {
            const creatorId = req.params.id;

            const creator = await this.creatorRepository.findById(creatorId);
            if (creator) {
                return responseStatus(res, 200, msg.user.userFound, creator);
            }
            return responseStatus(res, 200, msg.user.userNotFound, false);
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };

    updateCreatorStatus = async (req: Request & { user: any }, res: Response) => {
        try {
            const _id = req.params.id;
            if (!_id) {
                return responseStatus(res, 400, msg.common.invalidRequest, null);
            }
            const { status } = req.body;

            const updatedCreator = await this.creatorRepository.updateById(_id, { status });
            if (!updatedCreator) {
                return responseStatus(res, 404, msg.user.userNotFound, null);
            }

            return responseStatus(res, 200, 'creator status updated', updatedCreator);
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };



    // Soft delete by updating the isDeleted flag
    delete = async (req: Request & { user: any }, res: Response) => {
        try {
            const userId = req.params?.id || req.user?.payload?.userId;
            if (!userId) {
                return responseStatus(res, 400, msg.common.invalidRequest, null);
            }

            const updatedCreator = await this.creatorRepository.updateById(userId, { isDeleted: true });
            if (!updatedCreator) {
                return responseStatus(res, 404, msg.user.userNotFound, null);
            }

            return responseStatus(res, 200, msg.user.userDeletedSuccess, {});
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };

    uploadUserProfileImage = async (req: Request & { user: any }, res: Response) => {
        try {

            const userId = req.params?.id || req.user?.payload?.userId;

            if (!userId) {
                return responseStatus(res, 400, msg.common.invalidRequest, null);
            }

            const secure_url = await uploadImage(req, res);

            if (secure_url) {
                const updateData = { avatar: secure_url };
                const updatedUser = await this.creatorRepository.updateById(userId, updateData);
                return responseStatus(res, 200, 'Uploaded successfully', updatedUser);
            } else {
                return responseStatus(res, 500, msg.common.somethingWentWrong, 'Failed to upload image');
            }

        } catch (error) {
            if (error.statusCode) {
                return responseStatus(res, error.statusCode, error.message, null);
            }
            console.error('Error uploading profile image:', error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };


    updatePassword = async (req: Request & { user: any }, res: Response) => {
        try {
            const _id = req.user?.payload?.userId;
            const { oldPassword, newPassword } = req.body;

            const user = await this.creatorRepository.findById(_id);

            if (!user) {
                return responseStatus(res, 404, msg.user.userNotFound, null);
            }

            const passwordMatch = await argon2.verify(user.password, oldPassword);

            if (!passwordMatch) {
                return responseStatus(res, 401, msg.user.oldPasswordError, null);
            }

            const hashedNewPassword = await argon2.hash(newPassword);

            user.password = hashedNewPassword;
            const updateData = { password: hashedNewPassword };
            const updatedUser = await this.creatorRepository.updateById(_id, updateData);

            if (!updatedUser) {
                return responseStatus(res, 500, msg.user.userNotFound, null);
            }

            return responseStatus(res, 200, msg.user.PasswordChangeSuccessfully, null);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };

}
