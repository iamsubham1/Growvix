import * as jwt from 'jsonwebtoken';
import { msg } from '../helper/messages';
import * as argon2 from 'argon2';
import { responseStatus } from '../helper/responses';
import { Request, Response } from 'express';
import { Inject, Service } from 'typedi';
import { jwtSignIN } from '../configuration/config';
import * as dotenv from 'dotenv';
dotenv.config();
import { AdminRepository } from '../repository/adminRepository';
import { AdminModel } from '../models/adminModel';
import { userObjectCleanUp } from '../helper/utils';
import sendEmailWithPassword from '../helper/sendMail';
import uploadImage from '../helper/uploadImage'; // Import the uploadImage function from your helper

@Service()
export class AdminService {
    constructor(@Inject() private adminRepository: AdminRepository) { }

    private generatePassword(): string {
        const randomNumber = Math.floor(Math.random() * 10000);
        return `GrowVix@${randomNumber}`;
    }

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

            // Generate and hash password
            const generatedPassword = this.generatePassword();
            console.log(generatedPassword);
            user.password = await argon2.hash(generatedPassword);
            user.isDeleted = false;

            const newUser = await this.adminRepository.save(user);
            if (!newUser) {
                return responseStatus(res, 500, msg.user.errorInSaving, null);
            }


            // Send email with the auto-generated password
            await sendEmailWithPassword(newUser.email, generatedPassword);

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
            const _id = req.user?.payload?.userId
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

    updateAccountStatusById = async (req: Request & { user: any }, res: Response) => {
        try {
            const _id = req.params.id;
            if (!_id) {
                return responseStatus(res, 400, msg.common.invalidRequest, null);
            }
            const { status } = req.body;
            const updatedUser = await this.adminRepository.updateById(_id, { status });
            if (!updatedUser) {
                return responseStatus(res, 404, msg.user.userNotFound, null);
            }
            return responseStatus(res, 200, msg.user.userUpdatedSuccess, updatedUser);
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };

    updateMultipleStatus = async (req: Request, res: Response) => {
        try {
            const ids: string[] = req.body.ids;
            const { status } = req.body;

            // Validate input
            if (!Array.isArray(ids) || ids.length === 0 || typeof status !== 'string') {
                return responseStatus(res, 400, msg.common.invalidRequest, null);
            }

            const updatedUsers = await Promise.all(
                ids.map(async (_id) => {
                    const updatedUser = await this.adminRepository.updateById(_id, { status });
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

    delete = async (req: Request & { user: any }, res: Response) => {
        try {


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

    updatePassword = async (req: Request & { user: any }, res: Response) => {
        try {
            const _id = req.user?.payload?.userId;
            const { oldPassword, newPassword } = req.body;

            const user = await this.adminRepository.findById(_id);

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
            const updatedUser = await this.adminRepository.updateById(_id, updateData);

            if (!updatedUser) {
                return responseStatus(res, 500, msg.user.userNotFound, null);
            }

            return responseStatus(res, 200, msg.user.PasswordChangeSuccessfully, null);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };

    getAllEmployees = async (req: Request, res: Response) => {
        try {
            const employees = await this.adminRepository.findAll({ role: 'EMPLOYEE', isDeleted: false });

            const sanitizedEmployees = employees.map(employee => {
                return {
                    _id: employee._id,
                    name: employee.name,
                    email: employee.email,
                    role: employee.role,
                    businessList: employee.businessList,
                    picture: employee.picture
                };
            });
            return responseStatus(res, 200, msg.user.fetchedSuccessfully, sanitizedEmployees);
        } catch (error) {
            console.error("Error fetching employees:", error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };

    getEmployeeById = async (req: Request, res: Response) => {
        const employeeId = req.params.id;
        try {
            const employee = await this.adminRepository.findOne({ _id: employeeId, isDeleted: false })
            if (!employee) {
                return responseStatus(res, 404, 'Employee not found', employee);
            }
            employee.password = null;
            return responseStatus(res, 200, 'Employee fetched successfully', employee);
        } catch (error) {
            console.error("Error fetching employee:", error);
            return responseStatus(res, 500, 'Something went wrong', 'An unknown error occurred');
        }
    };

    assignBusinessToEmployee = async (req: Request, res: Response) => {
        try {
            const { businessId } = req.body;
            const employeeId = req.params.employeeId;

            if (!employeeId || !businessId) {
                return responseStatus(res, 400, 'Employee ID and Business ID are required', null);
            }

            const updatedEmployee = await this.adminRepository.addBusinessToList(employeeId, businessId);

            if (!updatedEmployee) {
                return responseStatus(res, 404, 'Employee not found or not an employee role', null);
            }

            return responseStatus(res, 200, 'Business assigned to employee successfully', updatedEmployee);
        } catch (error) {
            console.error("Error assigning business to employee:", error);
            return responseStatus(res, 500, 'Something went wrong', 'An unknown error occurred');
        }
    };

    softDelete = async (req: Request, res: Response) => {
        try {
            const _id = req.params.id;
            if (!_id) {
                return responseStatus(res, 400, msg.common.invalidRequest, null);
            }

            const updatedCreator = await this.adminRepository.updateById(_id, { isDeleted: true });
            if (!updatedCreator) {
                return responseStatus(res, 404, msg.user.userNotFound, null);
            }

            return responseStatus(res, 200, msg.user.userDeletedSuccess, {});
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };

    uploadUserProfileImage = async (req: Request, res: Response) => {
        try {

            const userId = req.params.id;

            if (!userId) {
                return responseStatus(res, 400, msg.common.invalidRequest, null);
            }

            const secure_url = await uploadImage(req, res);

            if (secure_url) {
                const updateData = { picture: secure_url };
                const updatedUser = await this.adminRepository.updateById(userId, updateData);
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

    searchEmployeeByName = async (req: Request & { user: any }, res: Response) => {
        try {
            const keyword = req.params.keyword;
            const regex = new RegExp(keyword, 'i');
            const results = await this.adminRepository.findAll({ name: { $regex: regex }, role: 'EMPLOYEE' });

            if (!results.length) {
                return responseStatus(res, 404, msg.user.userNotExist, null);
            }

            return responseStatus(res, 200, msg.user.userFound, results);
        } catch (error) {
            console.error(`Error occurred while searching for businesses: ${error.message}`);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };

    employeeDetailsWithBusiness = async (req: Request & { user: any }, res: Response) => {
        try {
            const _id = req.user?.payload?.userId;

            const employee = await this.adminRepository.findWithPopulate(
                { _id: _id, isDeleted: false },
                [
                    {
                        path: 'businessList',
                        select: 'name businessName subscription createdAt picture',
                        populate: {
                            path: 'subscription',
                            select: 'plan',
                            populate: {
                                path: 'plan',
                                select: 'name price'
                            }
                        }
                    }
                ]
            );

            if (!employee) {
                return responseStatus(res, 404, msg.user.userNotFound, null);
            }

            employee.password = null;

            return responseStatus(res, 200, msg.user.fetchedSuccessfully, employee);
        } catch (error) {
            console.error("Error fetching business assigned to employee:", error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };
}