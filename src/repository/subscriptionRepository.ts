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
}
