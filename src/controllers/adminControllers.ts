import { AdminService } from '../services/adminServices';
import { Inject, Service } from 'typedi';
import { responseStatus } from '../helper/responses';
import { msg } from '../helper/messages';
import { Request, Response } from 'express';
import { BusinessCategoryService } from '../services/businessCategoryServices';
import { SubscriptionService } from '../services/subscriptionService';


@Service()
export class AdminController {
    constructor(
        @Inject() private adminService: AdminService,
        private businessService: BusinessCategoryService,
        private subscriptionService: SubscriptionService,
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
    delete = async (req: Request & { user: any }, res: Response) => {
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

    updateEmployeeStatus = async (req: Request & { user: any }, res: Response) => {
        try {
            return await this.adminService.updateAccountStatusById(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

    updateMultipleEmployeeStatus = async (req: Request & { user: any }, res: Response) => {
        try {
            return await this.adminService.updateMultipleStatus(req, res);
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

    uploadImg = async (req: Request & { user: any }, res: Response) => {
        try {
            const result = await this.adminService.uploadUserProfileImage(req, res);
            return result;
        } catch (error) {
            console.error('Error uploading profile image:', error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

    search = async (req: Request & { user: any }, res: Response) => {
        try {

            return await this.adminService.searchEmployeeByName(req, res);

        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

    employeeDetailsWithBusiness = async (req: Request & { user: any }, res: Response) => {
        try {
            return await this.adminService.employeeDetailsWithBusiness(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);

        }
    };

    getSubcriptionDetails = async (req: Request, res: Response) => {
        try {
            return await this.subscriptionService.getSubscriptionDetails(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);

        }
    };


}