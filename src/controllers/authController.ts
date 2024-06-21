import { UserService } from '../services/userService';
import { Inject, Service } from 'typedi';
import { responseStatus } from '../helper/responses';
import { msg } from '../helper/messages';
import { Request, Response } from 'express';
import { BusinessService } from '../services/businessCategoryServices';

@Service()
export class AuthController {
    constructor(
        @Inject() private userService: UserService,
        private businessService: BusinessService,
    ) { }

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

    deleteUser = async (req: Request & { user: any }, res: Response) => {
        try {
            return await this.userService.delete(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

    findUserByEmail = async (req: Request & { user: any }, res: Response) => {
        try {
            return await this.userService.findUserByEmail(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

    findUserById = async (req: Request & { user: any }, res: Response) => {
        try {
            return await this.userService.findUserById(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

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
    }

    updateStatus = async (req: Request, res: Response) => {
        try {
            return await this.userService.updateBusinessStatus(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    }
}
