import { msg } from '../helper/messages';
import { responseStatus } from '../helper/responses';
import { Request, Response } from 'express';
import { Inject, Service } from 'typedi';

import * as dotenv from 'dotenv';
dotenv.config();
import { BusinessCategoryRepository } from '../repository/categoryRepository';
import { BusinessCategoryModel } from '../models/businessCategoryModel';

@Service()
export class BusinessService {
    constructor(@Inject() private businessRepository: BusinessCategoryRepository) {}

    create = async (req: Request, res: Response) => {
        try {
            const businessData: BusinessCategoryModel = req.body;

            if (!businessData.name) {
                return responseStatus(res, 400, msg.productCategory.nameError, null);
            }

            // Check if business with the same name already exists
            const existingBusiness = await this.businessRepository.findByName(businessData.name);
            if (existingBusiness) {
                return responseStatus(res, 400, msg.productCategory.alreadyExists, null);
            }

            const newBusiness = await this.businessRepository.save(businessData);

            if (!newBusiness) {
                return responseStatus(res, 500, msg.productCategory.saveError, null);
            }

            return responseStatus(res, 200, msg.productCategory.createdSuccess, newBusiness);
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };

    getAll = async (req: Request, res: Response) => {
        try {
            const businesses = await this.businessRepository.findAll();

            return responseStatus(res, 200, msg.productCategory.fetchedSuccess, businesses);
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };

    update = async (req: Request, res: Response) => {
        try {
            const businessCategoryId: string = req.params.id;

            const updateData = req.body;

            const updatedBusiness = await this.businessRepository.updateById(businessCategoryId, updateData);

            if (!updatedBusiness) {
                return responseStatus(res, 404, msg.productCategory.notFound, null);
            }

            return responseStatus(res, 200, msg.productCategory.updatedSuccess, updatedBusiness);
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };

    delete = async (req: Request, res: Response) => {
        try {
            const businessId: string = req.params.id;

            await this.businessRepository.deleteById(businessId);

            // Return success response
            return responseStatus(res, 200, msg.productCategory.deletedSuccess, {});
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };
}
