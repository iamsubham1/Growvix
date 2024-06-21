import { AdminService } from '../services/adminServices';

import { Inject, Service } from 'typedi';
import { responseStatus } from '../helper/responses';
import { msg } from '../helper/messages';
import { Request, Response } from 'express';
import { BusinessService } from '../services/businessCategoryServices';

@Service()
export class AdminController {
    constructor(
        @Inject() private adminService: AdminService,
        private businessService: BusinessService,
    ) { }

    registerAdmin = async (req: Request, res: Response) => {
        try {
            return await this.adminService.save(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

    loginAdmin = async (req: Request, res: Response) => {
        try {
            return await this.adminService.login(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

    updateAdmin = async (req: Request & { user: any }, res: Response) => {
        try {
            return await this.adminService.updateAccount(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

    //soft delete(admin/employee)
    deleteAdmin = async (req: Request & { user: any }, res: Response) => {
        try {
            return await this.adminService.softDelete(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

    createBusinessCategory = async (req: Request, res: Response) => {
        try {
            return await this.businessService.create(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

    updateBusinessCategory = async (req: Request, res: Response) => {
        try {
            return await this.businessService.update(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

    deleteBusinessCategory = async (req: Request, res: Response) => {
        try {
            return await this.businessService.delete(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

    updatePassword = async (req: Request & { user: any }, res: Response) => {
        try {

            return await this.adminService.updatePassword(req, res);

        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

    getAllEmployee = async (req: Request, res: Response) => {
        try {
            return await this.adminService.getAllEmployees(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    }

    getEmployeeById = async (req: Request, res: Response) => {
        try {
            return await this.adminService.getEmployeeById(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    }

    updateEmployee = async (req: Request & { user: any }, res: Response) => {
        try {
            return await this.adminService.updateAccountById(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

    assignBusiness = async (req: Request & { user: any }, res: Response) => {
        try {
            return await this.adminService.assignBusinessToEmployee(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    }
}
