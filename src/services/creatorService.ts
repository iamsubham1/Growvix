import * as jwt from 'jsonwebtoken';
import { msg } from '../helper/messages';
import * as argon2 from 'argon2';
import { responseStatus } from '../helper/responses';
import { Request, Response } from 'express';
import { Inject, Service } from 'typedi';
import { jwtSignIN } from '../configuration/config';
import * as dotenv from 'dotenv';
import sendEmailWithPassword from '../helper/sendMail';
import uploadImage from '../helper/uploadImage';
import { userObjectCleanUp } from '../helper/utils';
import { MainRepository } from '../repository/mainRepository';
import { UserModel, UserSchema } from '../models/userModel';

dotenv.config();

@Service()
export class CreatorService {
    constructor(@Inject() private mainRepository: MainRepository) { }

    private generatePassword(): string {
        const randomNumber = Math.floor(Math.random() * 10000);
        return `GrowVix@${randomNumber}`;
    }

    save = async (req: Request, res: Response) => {
        try {
            const { name, email, phoneNumber, ...other } = req.body;

            // Validate required fields
            if (!name || !email) {
                return responseStatus(res, 400, 'Name and email are required', null);
            }

            const existingCreator = await this.mainRepository.findByEmail({ email: email });
            if (existingCreator) {
                return responseStatus(res, 400, msg.user.userEmailExist, null);
            }

            if (phoneNumber) {
                const existingUserByPhoneNumber = await this.mainRepository.findByPhoneNumber(phoneNumber.toString());
                if (existingUserByPhoneNumber) {
                    return responseStatus(res, 400, msg.user.userPhoneNumberExist, null);
                }
            }
            // Generate and hash password
            const generatedPassword = this.generatePassword();
            console.log(generatedPassword);
            const hashedPassword = await argon2.hash(generatedPassword);


            const newUser: UserModel = new UserSchema({
                type: 'Creator',
                name: name,
                email: email,
                password: hashedPassword,
                phoneNumber: phoneNumber || null,
                isDeleted: false,
                status: 'Active',
                creator: {
                    ...other,

                }
            });


            // Save creator to database
            const newCreator = await this.mainRepository.save(newUser);
            if (!newCreator) {
                return responseStatus(res, 500, msg.user.errorInSaving, null);
            }

            // Send email with the auto-generated password

            await sendEmailWithPassword(email, generatedPassword);



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

            let user = await this.mainRepository.findByEmail({ email: emailOrPhoneNumber });

            if (!user) {
                const isPhoneNumber = /^\d+$/.test(emailOrPhoneNumber);
                if (isPhoneNumber) {
                    user = await this.mainRepository.findByPhoneNumber(emailOrPhoneNumber);
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
                const existingUserByPhoneNumber = await this.mainRepository.findByPhoneNumber(updateData.phoneNumber.toString());
                if (existingUserByPhoneNumber && existingUserByPhoneNumber._id.toString() !== _id) {
                    return responseStatus(res, 400, msg.user.userPhoneNumberExist, null);
                }
            }
            const updatedUser = await this.mainRepository.updateById(_id, updateData);
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
            const { page = 1, limit = 10 } = req.query;
            const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

            const allCreators = await this.mainRepository.findAll({ isDeleted: false, type: 'Creator' }, skip, parseInt(limit as string));
            if (!allCreators.length) {
                return responseStatus(res, 200, msg.user.fetchedSuccessfully, "No Creators Exist");
            }
            return responseStatus(res, 200, msg.user.fetchedSuccessfully, allCreators);
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.user.fetchFailed, 'An unknown error occurred');
        }
    };

    getCreatorById = async (req: Request, res: Response) => {
        try {
            const creatorId = req.params.id;

            const creator = await this.mainRepository.findById(creatorId);
            if (creator && creator.isDeleted === false) {
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

            const updatedCreator = await this.mainRepository.updateById(_id, { status });
            if (!updatedCreator) {
                return responseStatus(res, 404, msg.user.userNotFound, null);
            }

            return responseStatus(res, 200, 'creator status updated', updatedCreator);
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };


    updateMultipleCreatorStatus = async (req: Request & { user: any }, res: Response) => {
        try {
            const ids: string[] = req.body.ids;
            const { status } = req.body;

            if (!Array.isArray(ids) || ids.length === 0 || typeof status !== 'string') {
                return responseStatus(res, 400, msg.common.invalidRequest, null);
            }
            const updatedCreatorss = await Promise.all(
                ids.map(async (_id) => {
                    const updatedUser = await this.mainRepository.updateById(_id, { status });
                    return updatedUser;
                })
            );

            if (updatedCreatorss.some((creator) => !creator)) {
                return responseStatus(res, 404, msg.user.userNotExist, null);
            }

            return responseStatus(res, 200, 'Status updated successfully', updatedCreatorss);
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

            const updatedCreator = await this.mainRepository.updateById(userId, { isDeleted: true });
            if (!updatedCreator) {
                return responseStatus(res, 404, msg.user.userNotFound, null);
            }

            return responseStatus(res, 200, msg.user.userDeletedSuccess, {});
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };

    uploadCreatorProfileImage = async (req: Request & { user: any }, res: Response) => {
        try {

            const userId = req.params?.id || req.user?.payload?.userId;


            if (!userId) {
                return responseStatus(res, 400, msg.common.invalidRequest, null);
            }

            const secure_url = await uploadImage(req, res);

            if (secure_url) {
                const updateData = { picture: secure_url };
                const updatedUser = await this.mainRepository.updateById(userId, updateData);
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

            const user = await this.mainRepository.findById(_id);

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
            const updatedUser = await this.mainRepository.updateById(_id, updateData);

            if (!updatedUser) {
                return responseStatus(res, 500, msg.user.userNotFound, null);
            }

            return responseStatus(res, 200, msg.user.PasswordChangeSuccessfully, null);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };

    searchByName = async (req: Request & { user: any }, res: Response) => {
        try {
            const keyword = req.params.keyword;
            const regex = new RegExp(keyword, 'i');
            const results = await this.mainRepository.findAll({ name: { $regex: regex }, isDeleted: false });

            if (!results.length) {
                return responseStatus(res, 404, msg.user.userNotExist, null);
            }

            return responseStatus(res, 200, msg.user.userFound, results);
        } catch (error) {
            console.error(`Error occurred while searching for businesses: ${error.message}`);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };

    getCreatorStats = async (req: Request, res: Response) => {
        try {
            const totalCreators = await this.mainRepository.countTotalCreators();

            const now = new Date();
            let startDate: Date;

            const timeframe = req.query.timeframe;

            switch (timeframe) {
                case 'weekly':
                    startDate = new Date(now.setDate(now.getDate() - now.getDay()));
                    break;
                case 'monthly':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                case 'yearly':
                    startDate = new Date(now.getFullYear(), 0, 1);
                    break;
                default:
                    return responseStatus(res, 400, 'Invalid timeframe. Please use "weekly", "monthly", or "yearly".', null);
            }

            const newCreators = await this.mainRepository.countNewCreatorsByDateRange(startDate, new Date());


            const totalCreatorsAtStart = totalCreators - newCreators;

            const growthPercentage = totalCreatorsAtStart > 0 ? (newCreators / totalCreatorsAtStart) * 100 : 0;
            const stats = {
                totalCreators,
                newCreators,
                growthPercentage,
                timeframe,
            };

            return responseStatus(res, 200, 'Creator stats fetched successfully', stats);
        } catch (error) {
            console.error('Error fetching creator statistics:', error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    }
}