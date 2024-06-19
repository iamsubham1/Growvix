import { Inject, Service } from 'typedi';
import { responseStatus } from '../helper/responses';
import { msg } from '../helper/messages';
import { Request, Response } from 'express';
import { PlanService } from '../services/planServices';
import { SubscriptionService } from '../services/subscriptionService';

@Service()
export class PlanController {
    constructor(
        @Inject() private planService: PlanService,
        @Inject() private subscriptionService: SubscriptionService,
    ) {}

    addPlan = async (req: Request, res: Response) => {
        try {
            return await this.planService.addPlan(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

    updatePlan = async (req: Request, res: Response) => {
        try {
            return await this.planService.updatePlan(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

    deletePlan = async (req: Request, res: Response) => {
        try {
            return await this.planService.deletePlan(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

    getAllPlans = async (req: Request & { user: any }, res: Response) => {
        try {
            return await this.planService.getAllPlans(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

    getPlansByBillingType = async (req: Request & { user: any }, res: Response) => {
        try {
            return await this.planService.getPlansByBillingType(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };
}
