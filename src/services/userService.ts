import * as jwt from 'jsonwebtoken';
import { msg } from '../helper/messages';
import * as argon2 from 'argon2';
import { responseStatus } from '../helper/responses';
import { Request, Response } from 'express';
import { Inject, Service } from 'typedi';
import { jwtSignIN } from '../configuration/config';
import { userObjectCleanUp } from '../helper/utils';
import * as dotenv from 'dotenv';
import { UserModel, UserSchema } from '../models/userModel';
import { sendEmailWithPassword } from '../helper/sendMail';
import uploadImage from '../helper/uploadImage';
import { TaskRepository } from '../repository/taskRepository';
import { TaskSchema, TaskModel } from '../models/taskModel';
import { MainRepository } from '../repository/mainRepository';
dotenv.config();

@Service()
export class UserService {
    constructor(@Inject()
    private mainRepository: MainRepository,
        private taskRepository: TaskRepository
    ) { }

    private generatePassword(): string {
        const randomNumber = Math.floor(Math.random() * 10000);
        return `GrowVix@${randomNumber}`;
    }

    save = async (req: Request, res: Response) => {
        try {
            const user = req.body;

            if (!user.name || !user.email || !user.phoneNumber) {
                return responseStatus(res, 400, 'Name, email are required fields.', null);
            }

            if (user.email) {
                const existingUserByEmail = await this.mainRepository.findByEmail({ 'email': user.email });
                if (existingUserByEmail) {
                    return responseStatus(res, 400, msg.user.userEmailExist, null);
                }
            }
            if (user.phoneNumber) {
                const existingUserByPhoneNumber = await this.mainRepository.findByPhoneNumber(user.phoneNumber.toString());

                if (existingUserByPhoneNumber) {
                    return responseStatus(res, 400, msg.user.userPhoneNumberExist, null);
                }
            }

            // Generate and hash password
            const generatedPassword = this.generatePassword();
            console.log("generatedPassword", generatedPassword);
            const hashedPassword = await argon2.hash(generatedPassword);

            const newUser: UserModel = new UserSchema({
                type: 'Business',
                name: user.name,
                email: user.email,
                password: hashedPassword,
                isDeleted: false,
                status: 'Active',
                phoneNumber: user.phoneNumber,
                business: {
                    ...user
                }
            });

            const savedUser = await this.mainRepository.save(newUser);


            if (!savedUser) {
                return responseStatus(res, 500, msg.user.errorInSaving, null);
            };
            // Send email with the auto-generated password
            await sendEmailWithPassword(savedUser.email, generatedPassword, savedUser.email);

            const token = jwt.sign({ userId: savedUser._id }, jwtSignIN.secret);
            return responseStatus(res, 200, msg.user.userSavedSuccess, {
                token: token,
                user: newUser,

            });
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };// testesd works

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
    };// testesd works

    updateAccount = async (req: Request & { user: any }, res: Response) => {
        try {
            const _id = req.user?.payload?.userId;
            if (!_id) {
                return responseStatus(res, 400, msg.common.invalidRequest, null);
            }
            const updateData = req.body;
            console.log(updateData);
            if (updateData.phoneNumber) {
                const existingUserByPhoneNumber = await this.mainRepository.findByPhoneNumber(updateData.phoneNumber.toString());
                if (existingUserByPhoneNumber && existingUserByPhoneNumber._id.toString() !== _id) {
                    return responseStatus(res, 400, msg.user.userPhoneNumberExist, null);
                }
            };
            const updatedUser = await this.mainRepository.updateById(_id, updateData);
            if (!updatedUser) {
                return responseStatus(res, 404, msg.user.userNotFound, null);
            }
            return responseStatus(res, 200, msg.user.userUpdatedSuccess, updatedUser);
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };// testesd works

    //soft delete
    delete = async (req: Request & { user: any }, res: Response) => {
        try {
            const _id = req.params.id || req.user?.payload?.userId;
            if (!_id) {
                return responseStatus(res, 400, msg.common.invalidRequest, null);
            }
            await this.mainRepository.softDeleteById(_id);
            return responseStatus(res, 200, msg.user.userDeletedSuccess, {});
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };

    // findUserByEmail = async (req: Request & { user: any }, res: Response) => {
    //     try {
    //         const email = req.body.email;
    //         if (!email) {
    //             return responseStatus(res, 400, msg.common.emptyBody, null);
    //         }
    //         const user = await this.mainRepository.findByEmail({ email, isDeleted: false, type: 'Business' });
    //         if (user && user.isDeleted == false) {
    //             return responseStatus(res, 200, msg.user.userEmailExist, true);
    //         }
    //         return responseStatus(res, 200, msg.user.userEmailNotExist, false);
    //     } catch (error) {
    //         console.error(error);
    //         return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
    //     }
    // };

    findUserById = async (req: Request & { user: any }, res: Response) => {
        try {
            const userId = req.params.id;
            if (!userId) {
                return responseStatus(res, 400, msg.common.invalidRequest, null);
            }
            const user = await this.mainRepository.findById(userId);
            if (user.isDeleted == false && user.type == 'Business') {
                return responseStatus(res, 200, msg.user.userFound, user);
            }
            return responseStatus(res, 200, msg.user.userNotExist, false);
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };

    async findOrCreateUser(profile: any): Promise<{ existingUser: boolean; user: UserModel | null; token: string | null }> {
        let user = await this.mainRepository.findByEmail(profile.email);

        if (!user) {
            user = new UserSchema({
                type: 'Business',
                email: profile?.email,
                name: profile?.name,
                business: {
                    google_id: profile?.id,
                    verified_email: profile?.verified_email,
                },

                picture: profile?.picture,
            });

            user = await this.mainRepository.save(user);

            // Generate JWT token for the new user
            const token = jwt.sign({ userId: user._id }, jwtSignIN.secret);
            return { existingUser: false, user, token };
        }

        // Populate related data for existing user
        user = await UserSchema.findById(user._id).populate('subscription').populate('businessCategory').exec();

        // Generate JWT token for the existing user
        const token = jwt.sign({ userId: user._id }, jwtSignIN.secret);

        return { existingUser: true, user, token };
    };

    getAllUsers = async (req: Request, res: Response) => {
        try {
            const allUsers = await this.mainRepository.findAll({ isDeleted: false, type: 'Business' });

            if (!allUsers.length) {
                return responseStatus(res, 200, msg.user.fetchedSuccessfully, "No Users Exist");
            }
            const sanitizedData = allUsers.map((user) => {
                const userObj = user.toObject ? user.toObject() : user;

                return {
                    ...userObj,
                    password: null,
                };
            });
            return responseStatus(res, 200, msg.user.fetchedSuccessfully, sanitizedData);
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.user.fetchFailed, 'An unknown error occurred');
        }
    };// testesd works

    updateBusinessStatus = async (req: Request, res: Response) => {
        try {
            const _id = req.params.id;
            const { status } = req.body;
            console.log(status);

            if (!_id || typeof status !== 'string') {
                return responseStatus(res, 400, msg.common.invalidRequest, null);
            }

            const updatedUser = await this.mainRepository.updateStatusById(_id, status);

            if (!updatedUser) {
                return responseStatus(res, 404, msg.user.userNotExist, null);
            }

            return responseStatus(res, 200, 'status updated successfully', updatedUser);
        } catch (error) {
            console.error("Error updating business status:", error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };

    updateMultipleBusinessStatus = async (req: Request, res: Response) => {
        try {
            const ids: string[] = req.body.ids;
            const { status } = req.body;

            // Validate input
            if (!Array.isArray(ids) || ids.length === 0 || typeof status !== 'string') {
                return responseStatus(res, 400, msg.common.invalidRequest, null);
            }

            const updatedUsers = await Promise.all(
                ids.map(async (_id) => {
                    const updatedUser = await this.mainRepository.updateStatusById(_id, status);
                    return updatedUser;
                })
            );

            if (updatedUsers.some((user) => !user)) {
                return responseStatus(res, 404, msg.user.userNotExist, null);
            }

            return responseStatus(res, 200, 'Status updated successfully', updatedUsers);
        } catch (error) {
            console.error("Error updating business statuses:", error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    }

    uploadBusinessProfileImage = async (req: Request & { user: any }, res: Response) => {
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

            if (!_id) {
                return responseStatus(res, 400, msg.common.invalidRequest, null);
            };


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

    searchBusinessByName = async (req: Request & { user: any }, res: Response) => {
        try {
            const keyword = req.params.keyword;

            if (!keyword) {
                return responseStatus(res, 400, msg.queryParams.queryParamNotFound, null);
            };
            const regex = new RegExp(keyword, 'i');
            const results = await this.mainRepository.findAllWithPopulate(
                { 'business.businessName': { $regex: regex } },
                [
                    {
                        path: 'business.subscription',
                        select: 'status endDate',
                        populate: [
                            {
                                path: 'plan',
                                select: 'name price',
                            },
                            {
                                path: 'billingType',
                                select: 'name',
                            },
                        ],
                    },
                    {
                        path: 'business.businessCategory',
                        select: 'name',
                    },
                ]
            );

            if (!results.length) {
                return responseStatus(res, 404, msg.user.userNotExist, null);
            };

            return responseStatus(res, 200, msg.user.userFound, results);
        } catch (error) {
            console.error(`Error occurred while searching for businesses: ${error.message}`);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };// testesd works(populated)

    getBusinessStats = async (req: Request, res: Response) => {
        try {
            const totalUsers = await this.mainRepository.countTotalUsers();

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

            const newUsers = await this.mainRepository.countNewUsersByDateRange(startDate, new Date());

            const totalUsersAtStart = totalUsers - newUsers;

            const growthPercentage = totalUsersAtStart > 0 ? (newUsers / totalUsersAtStart) * 100 : 0;
            const stats = {
                totalUsers,
                newUsers,
                growthPercentage,
                timeframe,
            };

            return responseStatus(res, 200, 'User stats fetched successfully', stats);
        } catch (error) {
            console.error('Error fetching user statistics:', error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };

    // task services 
    createTask = async (req: Request & { user: any }, res: Response) => {
        try {
            const _id = req.user?.payload?.userId;
            if (!_id) {
                return responseStatus(res, 400, msg.common.invalidRequest, null);
            };
            const taskData: TaskModel = req.body;
            const newTask = await this.taskRepository.save({ ...taskData, businessId: _id });
            if (!newTask) {
                return responseStatus(res, 500, msg.task.saveError, null);
            }
            return responseStatus(res, 200, msg.task.createdSuccess, newTask);
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };

    getAllTasks = async (req: Request & { user: any }, res: Response) => {
        try {
            const _id = req.user?.payload?.userId;
            if (!_id) {
                return responseStatus(res, 400, msg.common.invalidRequest, null);
            };
            const tasks = await this.taskRepository.findAll({ businessId: _id });
            if (!tasks.length) {
                return responseStatus(res, 200, msg.task.fetchedSuccess, 'No tasks to show ');
            }
            return responseStatus(res, 200, msg.task.fetchedSuccess, tasks);


        } catch (error) {
            console.error('Error fetching user statistics:', error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }

    };

    getTaskStatistics = async (req: Request & { user: any }, res: Response) => {
        try {
            const _id = req.user?.payload?.userId;

            if (!_id) {
                return responseStatus(res, 400, msg.common.invalidRequest, null);
            };

            const now = new Date();
            let startDate: Date;

            const timeframe = req.query.timeframe as string;

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
                    return res.status(400).json({
                        statusMessage: 'Error',
                        status: 400,
                        success: false,
                        message: 'Invalid timeframe. Please use "weekly", "monthly", or "yearly".',
                    });
            }


            const tasks = await TaskSchema.find({
                startDate: { $gte: startDate },
                businessId: _id,
                status: { $in: ['ONGOING', 'COMPLETED'] },
            });

            // Calculate statistics
            let ongoingCount = 0;
            let completedCount = 0;

            tasks.forEach(task => {
                if (task.status === 'ONGOING') {
                    ongoingCount++;
                } else if (task.status === 'COMPLETED') {
                    completedCount++;
                }
            });


            const response = {
                timeframe,
                statistics: {
                    ongoing: ongoingCount,
                    completed: completedCount,
                },
            };

            return res.status(200).json({
                statusMessage: 'Success',
                status: 200,
                success: true,
                message: 'Task statistics fetched successfully',
                data: response,
            });
        } catch (error) {
            console.error('Error fetching task statistics:', error);
            return res.status(500).json({
                statusMessage: 'Error',
                status: 500,
                success: false,
                message: 'An unknown error occurred',
            });
        }
    };

    updateTaskStatus = async (req: Request & { user: any }, res: Response) => {
        try {
            const taskId = req.params?.id


            if (!taskId) {
                return responseStatus(res, 400, msg.common.invalidRequest, null);
            }
            const updatedTask = await this.taskRepository.updateById(taskId, req.body)
            if (!updatedTask) {
                return responseStatus(res, 404, msg.task.notFound, null);
            }

            return responseStatus(res, 200, 'status updated successfully', updatedTask);

        } catch (error) {
            console.error("Error updating task status:", error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }

    }
}
