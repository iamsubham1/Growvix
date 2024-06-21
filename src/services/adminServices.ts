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

    updateAccountById = async (req: Request & { user: any }, res: Response) => {
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
            const employees = await this.adminRepository.find({ role: 'EMPLOYEE', isDeleted: false });
            return responseStatus(res, 200, msg.user.fetchedSuccessfully, employees);
        } catch (error) {
            console.error("Error fetching employees:", error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };

    getEmployeeById = async (req: Request, res: Response) => {
        const employeeId = req.params.id;
        console.log(employeeId);
        try {
            const employee = await this.adminRepository.find({ _id: employeeId, isDeleted: false });
            console.log(employee);
            if (!employee) {
                return responseStatus(res, 404, 'Employee not found', employee);
            }

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
}