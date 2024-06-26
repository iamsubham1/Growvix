import { Inject, Service } from 'typedi';
import { Request, Response } from 'express';
import { PlanModel } from '../models/plansModel';
import { PlanRepository } from '../repository/planRepository';
import { responseStatus } from '../helper/responses';
import { msg } from '../helper/messages';
import { ObjectId } from 'mongodb'; // Import ObjectId from the MongoDB driver
import { SubscriptionRepository } from '../repository/subscriptionRepository';

@Service()
export class PlanService {
    constructor(
        @Inject() private planRepository: PlanRepository,
        private subscriptionRepository: SubscriptionRepository,
    ) { }

    addPlan = async (req: Request, res: Response) => {
        try {
            const planData: PlanModel = req.body;
            const newPlan = await this.planRepository.save(planData);
            if (!newPlan) {
                return responseStatus(res, 500, msg.plan.failed, null);
            }
            return responseStatus(res, 200, msg.plan.success, newPlan);
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };

    updatePlan = async (req: Request, res: Response) => {
        try {
            const planId = req.params.id;
            const updatedPlanData: PlanModel = req.body;
            const updatedPlan = await this.planRepository.updateById(planId, updatedPlanData);
            if (!updatedPlan) {
                return responseStatus(res, 404, msg.plan.notFound, null);
            }
            return responseStatus(res, 200, msg.plan.updateSuccess, updatedPlan);
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.plan.updateFailed, 'An unknown error occurred');
        }
    };

    deletePlan = async (req: Request, res: Response) => {
        try {
            const planId = req.params.id;
            const deletedPlan = await this.planRepository.deleteById(planId);
            if (!deletedPlan) {
                return responseStatus(res, 404, msg.plan.notFound, null);
            }
            return responseStatus(res, 200, msg.plan.deleteSuccess, deletedPlan);
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.plan.deleteError, 'An unknown error occurred');
        }
    };

    getAllPlans = async (req: Request & { user: any }, res: Response) => {
        try {
            const plans = await this.planRepository.findAll();
            const userId = req.params?.userId;

            if (userId) {
                const userSubscriptions = await this.subscriptionRepository.getUserSubscriptions(userId);
                const userPurchasedPlans = userSubscriptions.map((subscription) => subscription.plan.toString());

                const plansWithPurchaseStatus = plans.map((plan) => {
                    const purchaseStatus = userPurchasedPlans.includes(plan._id.toString());
                    return { ...plan.toObject(), purchased: purchaseStatus };
                });
                console.log("this");
                return responseStatus(res, 200, msg.plan.fetchedSuccess, plansWithPurchaseStatus);
            } else {
                return responseStatus(res, 200, msg.plan.fetchedSuccess, plans);
            }
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.plan.fetchFailed, 'An unknown error occurred');
        }
    };

    getPlansByBillingType = async (req: Request & { user: any }, res: Response) => {
        try {

            const billingTypeId = req.params.id;
            if (!billingTypeId) {
                return responseStatus(res, 400, msg.common.recordNotFound, 'Billing Type ID is required');
            }
            const query = { billingType: new ObjectId(billingTypeId) };
            const plans = await this.planRepository.findMany(query);

            // const userId = req.user?.userId;
            const userId = Array.isArray(req.query.userId) ? req.query.userId[0] : req.query.userId;
            let userPurchasedPlans: string[] = [];
            if (userId && typeof userId === 'string') {
                const userSubscriptions = await this.subscriptionRepository.findByUserId(userId);
                userPurchasedPlans = userSubscriptions.map((subscription) => subscription.plan.toString());
            }

            const plansWithPurchaseStatus = plans.map((plan) => {
                const purchased = userPurchasedPlans.includes(plan._id.toString());
                return { ...plan.toObject(), purchased };
            });

            if (!plans || plans.length === 0) {
                return responseStatus(res, 404, msg.plan.notFound, 'No plans found for the given billing type');
            }
            return responseStatus(res, 200, msg.plan.fetchedSuccess, plansWithPurchaseStatus);
        } catch (error) {
            console.error('Error fetching plans:', error);
            return responseStatus(res, 500, msg.plan.fetchFailed, 'An unknown error occurred');
        }
    };
}
