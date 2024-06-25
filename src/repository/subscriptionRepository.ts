// subscriptionRepository.ts
import mongoose from 'mongoose';
import { ISubscriptionPlan, SubscriptionPlanModel } from '../models/subcriptionModel';
import { Service } from 'typedi';

@Service()
export class SubscriptionRepository {
    async save(subscription: ISubscriptionPlan): Promise<ISubscriptionPlan | null> {
        try {
            const newSubscription = new SubscriptionPlanModel(subscription);
            return await newSubscription.save();
        } catch (error) {
            console.error('Error saving subscription:', error);
            return null;
        }
    }

    async update(subscription: ISubscriptionPlan): Promise<ISubscriptionPlan | null> {
        try {
            const updatedSubscription = await SubscriptionPlanModel.findByIdAndUpdate(subscription._id, subscription, { new: true });
            return updatedSubscription;
        } catch (error) {
            console.error('Error updating subscription:', error);
            return null;
        }
    }

    async updateById(_id: string, subscriptionData: Partial<ISubscriptionPlan>): Promise<ISubscriptionPlan | null> {
        try {
            const updatedSubscription = await SubscriptionPlanModel.findByIdAndUpdate(_id, subscriptionData, { new: true });
            return updatedSubscription;
        } catch (error) {
            console.error('Error updating subscription by ID:', error);
            return null;
        }
    }

    async findById(subscriptionId: string): Promise<ISubscriptionPlan | null> {
        try {
            const subscription = await SubscriptionPlanModel.findById(subscriptionId);
            return subscription;
        } catch (error) {
            console.error('Error finding subscription by ID:', error);
            return null;
        }
    }

    async deleteById(subscriptionId: string): Promise<ISubscriptionPlan | null> {
        try {
            const deletedSubscription = await SubscriptionPlanModel.findByIdAndDelete(subscriptionId);
            return deletedSubscription;
        } catch (error) {
            console.error('Error deleting subscription:', error);
            return null;
        }
    }

    async findMany(query: any): Promise<ISubscriptionPlan[]> {
        try {
            const subscriptions = await SubscriptionPlanModel.find(query);
            return subscriptions;
        } catch (error) {
            console.error('Error finding subscriptions:', error);
            return [];
        }
    }

    async findByUserId(userId: string): Promise<ISubscriptionPlan[] | null> {
        try {
            const subscriptions = await SubscriptionPlanModel.find({ userId: new mongoose.Types.ObjectId(userId) });
            return subscriptions;
        } catch (error) {
            console.error('Error finding subscriptions by user ID:', error);
            return null;
        }
    }

    async findAll(): Promise<ISubscriptionPlan[]> {
        try {
            const subscriptions = await SubscriptionPlanModel.find();
            return subscriptions;
        } catch (error) {
            console.error('Error finding all subscriptions:', error);
            return [];
        }
    }

    async getUserSubscriptions(userId: string): Promise<ISubscriptionPlan[] | null> {
        try {
            const subscriptions = await SubscriptionPlanModel.find({ userId: new mongoose.Types.ObjectId(userId) });
            return subscriptions;
        } catch (error) {
            console.error('Error finding subscriptions by user ID:', error);
            return null;
        }
    }


    async getPlanSubscriptionCounts() {
        try {
            const subscriptionCounts = await SubscriptionPlanModel.aggregate([
                {
                    $group: {
                        _id: '$plan',
                        count: { $sum: 1 }
                    }
                },
                {
                    $lookup: {
                        from: 'plans', // Collection name of PlanModel
                        localField: '_id',
                        foreignField: '_id',
                        as: 'planDetails'
                    }
                },
                {
                    $unwind: '$planDetails'
                },
                {
                    $group: {
                        _id: '$planDetails.name',
                        total: { $sum: '$count' }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        planName: '$_id',
                        count: '$total'
                    }
                }
            ]);


            // Example output handling
            console.log('Subscription Counts:', subscriptionCounts);

            // Example output formatting (assuming subscriptionCounts is an array of objects)
            subscriptionCounts.forEach((subscriptionCount) => {
                console.log(`${subscriptionCount.planName}: ${subscriptionCount.count}`);
            });

            return subscriptionCounts;
        } catch (error) {
            console.error('Error fetching subscription counts:', error);
            throw error; // Handle or rethrow as needed
        }
    }

}
