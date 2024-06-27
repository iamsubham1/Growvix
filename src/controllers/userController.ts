import { Inject, Service } from 'typedi';
import { Request, Response } from 'express';
import { responseStatus } from '../helper/responses';
import { msg } from '../helper/messages';
import { UserService } from '../services/userService';
import { BusinessCategoryService } from '../services/businessCategoryServices';

@Service()
export class UserController {
    constructor(
        @Inject() private userService: UserService,
        private businessService: BusinessCategoryService,
    ) { }

    // User Operations

    registerUser = async (req: Request, res: Response) => {
        try {
            return await this.userService.save(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

    loginUser = async (req: Request, res: Response) => {
        try {
            return await this.userService.login(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

    updateUser = async (req: Request & { user: any }, res: Response) => {
        try {
            return await this.userService.updateAccount(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

    // deleteUser = async (req: Request & { user: any }, res: Response) => {
    //     try {
    //         return await this.userService.delete(req, res);
    //     } catch (error) {
    //         return responseStatus(res, 500, msg.common.somethingWentWrong, error);
    //     }
    // };

    // //search business by id for admin
    // findUserById = async (req: Request & { user: any }, res: Response) => {
    //     try {
    //         return await this.userService.findUserById(req, res);
    //     } catch (error) {
    //         return responseStatus(res, 500, msg.common.somethingWentWrong, error);
    //     }
    // };

    // // Business Operations

    getAllBusinessCategory = async (req: Request, res: Response) => {
        try {
            return await this.businessService.getAll(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

    getAllBusiness = async (req: Request, res: Response) => {
        try {
            return await this.userService.getAllUsers(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

    // updateStatus = async (req: Request, res: Response) => {
    //     try {
    //         return await this.userService.updateBusinessStatus(req, res);
    //     } catch (error) {
    //         return responseStatus(res, 500, msg.common.somethingWentWrong, error);
    //     }
    // };


    // updateMultipleStatus = async (req: Request, res: Response) => {
    //     try {
    //         return await this.userService.updateMultipleBusinessStatus(req, res);
    //     } catch (error) {
    //         return responseStatus(res, 500, msg.common.somethingWentWrong, error);
    //     }
    // };
    // // Image Upload

    // uploadImg = async (req: Request & { user: any }, res: Response) => {
    //     try {
    //         const result = await this.userService.uploadUserProfileImage(req, res);
    //         return result;
    //     } catch (error) {
    //         console.error('Error uploading profile image:', error);
    //         return responseStatus(res, 500, msg.common.somethingWentWrong, error);
    //     }
    // };


    // updatePassword = async (req: Request & { user: any }, res: Response) => {
    //     try {

    //         return await this.userService.updatePassword(req, res);

    //     } catch (error) {
    //         return responseStatus(res, 500, msg.common.somethingWentWrong, error);
    //     }
    // };

    searchBusiness = async (req: Request & { user: any }, res: Response) => {
        try {

            return await this.userService.searchBusinessByName(req, res);

        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

    // getBusinessStats = async (req: Request, res: Response) => {
    //     try {
    //         return await this.userService.getBusinessStats(req, res);
    //     } catch (error) {
    //         return responseStatus(res, 500, msg.common.somethingWentWrong, error);

    //     }
    // };

    // createTask = async (req: Request & { user: any }, res: Response) => {
    //     try {
    //         return await this.userService.createTask(req, res);
    //     } catch (error) {
    //         return responseStatus(res, 500, msg.common.somethingWentWrong, error);

    //     }
    // };

    // getAllTasks = async (req: Request & { user: any }, res: Response) => {
    //     try {
    //         return await this.userService.getAllTasks(req, res);
    //     } catch (error) {
    //         return responseStatus(res, 500, msg.common.somethingWentWrong, error);

    //     }
    // };

    // updateTaskStatus = async (req: Request & { user: any }, res: Response) => {
    //     try {
    //         return await this.userService.updateTaskStatus(req, res);
    //     } catch (error) {
    //         return responseStatus(res, 500, msg.common.somethingWentWrong, error);

    //     }
    // };

    // taskStats = async (req: Request & { user: any }, res: Response) => {
    //     try {
    //         return await this.userService.getTaskStatistics(req, res);
    //     } catch (error) {
    //         return responseStatus(res, 500, msg.common.somethingWentWrong, error);

    //     }
    // };
}




