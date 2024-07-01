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
import { UserModel, UserSchema } from '../models/userModel';
import { userObjectCleanUp } from '../helper/utils';
import { sendEmailWithPassword, sendEmailWithOTP } from '../helper/sendMail';
import uploadImage from '../helper/uploadImage';
import { ResetPasswordRepository } from '../repository/resetPasswordRepository';
import { ResetPasswordSchema } from "../models/resetPasswordModel";
import { timingSafeEqual } from 'crypto';

@Service()
export class AdminService {
    constructor(@Inject() private mainRepository: MainRepository,
        private resetPasswordRepository: ResetPasswordRepository) { }

    private generatePassword(): string {
        const randomNumber = Math.floor(Math.random() * 10000);
        return `GrowVix@${randomNumber}`;
    }


    save = async (req: Request, res: Response) => {
        try {
            const { name, email, role } = req.body;

            if (!name || !email || !role) {
                return responseStatus(res, 400, 'Name, email, and role are required fields.', null);
            }

            const existingUser = await this.mainRepository.findByEmail({ 'email': email });
            if (existingUser) {
                return responseStatus(res, 400, 'User with this email already exists.', null);
            }

            const generatedPassword = this.generatePassword();
            console.log("generated password", generatedPassword);
            const hashedPassword = await argon2.hash(generatedPassword);

            const newUser: UserModel = new UserSchema({
                type: 'Admin',
                name: name,
                email: email,
                password: hashedPassword,
                isDeleted: false,
                status: 'Active',
                role: role === 'employee' ? 'EMPLOYEE' : role === 'admin' ? 'ADMIN' : "",
                admin: {
                    businessList: [],
                    picture: ''
                }
            });

            const savedUser = await this.mainRepository.save(newUser);


            if (!savedUser) {
                return responseStatus(res, 500, 'Error saving user.', null);
            }

            await sendEmailWithPassword(savedUser.email, generatedPassword);

            const token = jwt.sign({ userId: savedUser._id, role: savedUser.role }, jwtSignIN.secret);

            return responseStatus(res, 200, 'User saved successfully.', {
                token: token,
                user: savedUser,
            });
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, 'An unknown error occurred.', null);
        }
    }; //tested works

    login = async (req: Request, res: Response) => {
        try {
            const { email, password }: UserModel = req.body;
            const user = await this.mainRepository.findByEmail({ email: email });
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
    }; //tested works

    updateAccount = async (req: Request & { user: any }, res: Response) => {
        try {
            const _id = req.user?.payload?.userId;
            if (!_id) {
                return responseStatus(res, 400, msg.common.invalidRequest, null);
            }
            const updateData = req.body;
            const updatedUser = await this.mainRepository.updateById(_id, updateData);
            if (!updatedUser) {
                return responseStatus(res, 404, msg.user.userNotFound, null);
            }
            return responseStatus(res, 200, msg.user.userUpdatedSuccess, updatedUser);
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };//tested works

    updateAccountStatusById = async (req: Request & { user: any }, res: Response) => {
        try {
            const _id = req.params.id;
            if (!_id) {
                return responseStatus(res, 400, msg.common.invalidRequest, null);
            }
            const { status } = req.body;
            const updatedUser = await this.mainRepository.updateById(_id, { status });
            if (!updatedUser) {
                return responseStatus(res, 404, msg.user.userNotFound, null);
            }
            return responseStatus(res, 200, msg.user.userUpdatedSuccess, updatedUser);
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    }; //tested works

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
                    const updatedUser = await this.mainRepository.updateById(_id, { status });
                    return updatedUser;
                }),
            );

            if (updatedUsers.some((user) => !user)) {
                return responseStatus(res, 404, msg.user.userNotExist, null);
            }

            return responseStatus(res, 200, 'Status updated successfully', updatedUsers);
        } catch (error) {
            console.error('Error updating business statuses:', error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };

    delete = async (req: Request & { user: any }, res: Response) => {
        try {
            const _id = req.user?.payload?.userId;
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

    updatePassword = async (req: Request & { user: any }, res: Response) => {
        try {
            const _id = req.user?.payload?.userId;
            const { oldPassword, newPassword } = req.body;


            if (oldPassword === newPassword) {
                return responseStatus(res, 404, msg.user.passwordShouldNotSame, null);
            };

            const user = await this.mainRepository.findById(_id);

            if (!user) {
                return responseStatus(res, 404, msg.user.userNotFound, null);
            };

            const passwordMatch = await argon2.verify(user.password, oldPassword);

            if (!passwordMatch) {
                return responseStatus(res, 401, msg.user.oldPasswordError, null);
            };

            const hashedNewPassword = await argon2.hash(newPassword);

            const updateData = { password: hashedNewPassword };
            const updatedUser = await this.mainRepository.updateById(_id, updateData);

            if (!updatedUser) {
                return responseStatus(res, 500, 'Failed to update password', null);
            };

            return responseStatus(res, 200, msg.user.PasswordChangeSuccessfully, null);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };

    getAllEmployees = async (req: Request, res: Response) => {

        try {
            const employees = await this.mainRepository.findAllWithPopulate(
                { 'role': 'EMPLOYEE', isDeleted: false }, [{
                    path: 'admin.businessList',
                    select: 'name businessName subscription createdAt picture'
                }]

            );

            if (!employees.length) {
                return responseStatus(res, 200, msg.user.fetchedSuccessfully, "No Employee Exist");
            };

            const sanitizedEmployees = employees.map((employee) => ({
                _id: employee._id,
                name: employee.name,
                email: employee.email,
                role: employee.role,
                businessList: employee.admin?.businessList,
                picture: employee.picture,
            }));

            return responseStatus(res, 200, msg.user.fetchedSuccessfully, sanitizedEmployees);
        } catch (error) {
            console.error('Error fetching employees:', error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };//tested works(populated businessList)

    getEmployeeById = async (req: Request, res: Response) => {
        const employeeId = req.params.id;
        try {
            const employee = await this.mainRepository.findWithPopulate({ _id: employeeId, isDeleted: false, 'role': 'EMPLOYEE' }, [{
                path: 'admin.businessList',
                select: 'name businessName subscription createdAt picture'
            }]);


            if (!employee) {
                return responseStatus(res, 404, 'Employee not found', employee);
            };
            employee.password = null;
            return responseStatus(res, 200, 'Employee fetched successfully', employee);
        } catch (error) {
            console.error('Error fetching employee:', error);
            return responseStatus(res, 500, 'Something went wrong', 'An unknown error occurred');
        }
    };//tested works(populated businessList)

    assignBusinessToEmployee = async (req: Request, res: Response) => {
        try {
            const { businessId } = req.body;
            const employeeId = req.params.employeeId;

            console.log(employeeId, businessId);
            if (!employeeId || !businessId || !Array.isArray(businessId) || businessId.length < 1) {
                return responseStatus(res, 400, 'Employee ID and at least one Business ID are required', null);
            }
            const updatedEmployee = await this.mainRepository.addBusinessesToList(employeeId, businessId);

            if (!updatedEmployee) {
                return responseStatus(res, 404, 'Employee not found', null);
            }
            return responseStatus(res, 200, 'Businesses assigned to employee successfully', updatedEmployee);
        } catch (error) {
            console.error('Error assigning businesses to employee:', error);
            return responseStatus(res, 500, 'Something went wrong', 'An unknown error occurred');
        }
    }; //tested works

    softDelete = async (req: Request & { user: any }, res: Response) => {
        try {
            const _id = req.params?.id || req.user?.payload?.userId;
            if (!_id) {
                return responseStatus(res, 400, msg.user.userIdNotFound, null);
            }

            const updatedUser = await this.mainRepository.updateById(_id, { isDeleted: true });
            if (!updatedUser) {
                return responseStatus(res, 404, msg.user.userNotFound, null);
            }

            return responseStatus(res, 200, msg.user.userDeletedSuccess, {});
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    }; //tested works

    uploadUserProfileImage = async (req: Request & { user: any }, res: Response) => {
        try {
            const userId = req?.params?.id || req.user?.payload?.userId;

            if (!userId) {
                return responseStatus(res, 400, msg.common.invalidRequest, null);
            }

            const secure_url = await uploadImage(req, res);

            if (secure_url) {
                const updateData = { picture: secure_url };
                const updatedUser = await this.mainRepository.updateById(userId, updateData);
                console.log(updatedUser);
                if (!updatedUser) {
                    return responseStatus(res, 500, 'uploaded but Failed to save in db', {});

                }
                return responseStatus(res, 200, 'Uploaded successfully', updatedUser);
            } else {
                return responseStatus(res, 500, 'Failed to upload image', {});
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

            if (!keyword) {
                return responseStatus(res, 400, msg.queryParams.queryParamNotFound, 'Keyword parameter is missing');
            }
            const regex = new RegExp(keyword, 'i');
            const results = await this.mainRepository.findAll({ name: { $regex: regex }, 'role': 'EMPLOYEE', isDeleted: false });

            if (!results.length) {
                return responseStatus(res, 404, msg.user.userNotExist, null);
            }

            return responseStatus(res, 200, msg.user.userFound, results);
        } catch (error) {
            console.error(`Error occurred while searching for businesses: ${error.message}`);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };//tested works

    globalSearch = async (req: Request & { user: any }, res: Response) => {
        try {
            const keyword = req.params.keyword;

            if (!keyword) {
                return responseStatus(res, 400, msg.queryParams.queryParamNotFound, 'Keyword parameter is missing');
            }

            const regex = new RegExp(keyword, 'i');

            const [creators, employees, businesses] = await Promise.all([
                // Search creators
                this.mainRepository.findAll({ name: { $regex: regex }, isDeleted: false, type: 'Creator' }),

                // Search employees
                this.mainRepository.findAll({ name: { $regex: regex }, 'role': 'EMPLOYEE', isDeleted: false }),

                // Search businesses
                this.mainRepository.findAllWithPopulate(
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
                )
            ]);

            const results = {
                creators: creators.map(creator => ({ ...creator.toObject(), type: 'Creator' })),
                employees: employees.map(employee => ({ ...employee.toObject(), type: 'Employee' })),
                businesses: businesses.map(business => ({ ...business.toObject(), type: 'Business' }))
            };

            const totalResults = creators.length + employees.length + businesses.length;

            if (totalResults === 0) {
                return responseStatus(res, 404, msg.user.userNotExist, null);
            }

            return responseStatus(res, 200, msg.user.userFound, results);

        } catch (error) {
            console.error(`Error occurred during global search: ${error.message}`);
            return responseStatus(res, 500, msg.common.somethingWentWrong, null);
        }
    };


    employeeDetailsWithBusiness = async (req: Request & { user: any }, res: Response) => {
        try {
            const _id = req.user?.payload?.userId;

            if (!_id) {
                return responseStatus(res, 404, msg.user.userIdNotFound, null);
            }

            const employee = await this.mainRepository.findWithPopulate({ _id: _id, isDeleted: false }, [
                {
                    path: 'admin.businessList',
                    select: 'name businessName subscription createdAt picture',
                    populate: {
                        path: 'business.subscription',
                        select: 'plan',
                        populate: {
                            path: 'plan',
                            select: 'name price',
                        },
                    },
                },
            ]);

            if (!employee) {
                return responseStatus(res, 404, msg.user.userNotFound, null);
            }

            employee.password = null;

            return responseStatus(res, 200, msg.user.fetchedSuccessfully, employee);
        } catch (error) {
            console.error('Error fetching business assigned to employee:', error);
            return responseStatus(res, 500, msg.user.fetchFailed, 'An unknown error occurred');
        }
    };//tested works(populated)



};
