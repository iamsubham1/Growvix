import { Inject, Service } from 'typedi';
import { Request, Response } from 'express';
import { SubscriptionPlan } from '../models/subscriptionModel';
import { SubscriptionRepository } from '../repository/subscriptionRepository';
import { responseStatus } from '../helper/responses';
import { msg } from '../helper/messages';
import { ObjectId } from 'mongodb'; // Import ObjectId from the MongoDB driver

@Service()
export class SubscriptionService {
    constructor(@Inject() private subscriptionRepository: SubscriptionRepository) { }

    createSubscription = async (req: Request, res: Response) => {
        try {
            const subscriptionData: SubscriptionPlan = req.body;
            const newSubscription = await this.subscriptionRepository.save(subscriptionData);
            if (!newSubscription) {
                return responseStatus(res, 500, msg.subscription.failed, null);
            }
            return responseStatus(res, 200, msg.subscription.success, newSubscription);
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };

    updateSubscription = async (req: Request, res: Response) => {
        try {
            const subscriptionId = req.params.id;
            const updatedSubscriptionData: SubscriptionPlan = req.body;
            const updatedSubscription = await this.subscriptionRepository.updateById(subscriptionId, updatedSubscriptionData);
            if (!updatedSubscription) {
                return responseStatus(res, 404, msg.subscription.notFound, null);
            }
            return responseStatus(res, 200, msg.subscription.updateSuccess, updatedSubscription);
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.subscription.updateFailed, 'An unknown error occurred');
        }
    };

    deleteSubscription = async (req: Request, res: Response) => {
        try {
            const subscriptionId = req.params.id;
            const deletedSubscription = await this.subscriptionRepository.deleteById(subscriptionId);
            if (!deletedSubscription) {
                return responseStatus(res, 404, msg.subscription.notFound, null);
            }
            return responseStatus(res, 200, msg.subscription.deleteSuccess, deletedSubscription);
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.subscription.deleteError, 'An unknown error occurred');
        }
    };

    getUserSubscriptions = async (userId: string) => {
        try {
            const query = { userId: new ObjectId(userId) };
            return await this.subscriptionRepository.findMany(query);
        } catch (error) {
            console.error('Error fetching user subscriptions:', error);
            return null;
        }
    };

    getSubscriptionDetails = async (req: Request, res: Response) => {
        try {

            const stats = await this.subscriptionRepository.getPlanSubscriptionCounts();

            return responseStatus(res, 200, msg.subscription.updateSuccess, stats);
        } catch (error) {
            console.error('Error fetching user subscriptions:', error);
            return null;
        }
    };

}
