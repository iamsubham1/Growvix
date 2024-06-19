import { Service, Inject } from 'typedi';
import { Request, Response } from 'express';
import { BillingTypeService } from '../services/billingTypeServices';
import { responseStatus } from '../helper/responses';
import { msg } from '../helper/messages';

@Service()
export class BillingTypeController {
    constructor(@Inject() private billingTypeService: BillingTypeService) {}

    createBillingType = async (req: Request, res: Response) => {
        try {
            return await this.billingTypeService.add(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

    updateBillingType = async (req: Request, res: Response) => {
        try {
            return await this.billingTypeService.update(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

    deleteBillingType = async (req: Request, res: Response) => {
        try {
            return await this.billingTypeService.delete(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

    getAllBillingTypes = async (req: Request, res: Response) => {
        try {
            return await this.billingTypeService.getAll(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };
}
