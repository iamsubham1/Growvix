import { Inject, Service } from 'typedi';
import { Request, Response } from 'express';
import { BillingTypeModel } from '../models/billingTypeModel';
import { BillingTypeRepository } from '../repository/billingTypeRepository';
import { responseStatus } from '../helper/responses';
import { msg } from '../helper/messages';

@Service()
export class BillingTypeService {
    constructor(@Inject() private billingTypeRepository: BillingTypeRepository) {}

    add = async (req: Request, res: Response) => {
        try {
            const billingTypeData: BillingTypeModel = req.body;
            const newBillingType = await this.billingTypeRepository.save(billingTypeData);
            if (!newBillingType) {
                return responseStatus(res, 500, msg.billingType.failed, null);
            }
            return responseStatus(res, 200, msg.billingType.success, newBillingType);
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };

    update = async (req: Request, res: Response) => {
        try {
            const billingTypeId = req.params.id;
            const updatedBillingTypeData: BillingTypeModel = req.body;
            const updatedBillingType = await this.billingTypeRepository.updateById(billingTypeId, updatedBillingTypeData);
            if (!updatedBillingType) {
                return responseStatus(res, 404, msg.billingType.notFound, null);
            }
            return responseStatus(res, 200, msg.billingType.updateSuccess, updatedBillingType);
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.billingType.updateFailed, 'An unknown error occurred');
        }
    };

    delete = async (req: Request, res: Response) => {
        try {
            const billingTypeId = req.params.id;
            const deletedBillingType = await this.billingTypeRepository.deleteById(billingTypeId);
            if (!deletedBillingType) {
                return responseStatus(res, 404, msg.billingType.notFound, null);
            }
            return responseStatus(res, 200, msg.billingType.deleteSuccess, deletedBillingType);
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.billingType.deleteError, 'An unknown error occurred');
        }
    };

    getAll = async (req: Request, res: Response) => {
        try {
            const billingTypes = await this.billingTypeRepository.findAll();
            return responseStatus(res, 200, msg.billingType.fetchedSuccess, billingTypes);
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.billingType.fetchFailed, 'An unknown error occurred');
        }
    };
}
