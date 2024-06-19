import { PlanModel, PlanSchema } from '../models/plansModel';
import { Service } from 'typedi';

@Service()
export class PlanRepository {
    async save(plan: PlanModel): Promise<PlanModel | null> {
        const planData = new PlanSchema(plan);
        return new PlanSchema(planData).save();
    }

    async updateById(_id: string, planData: PlanModel): Promise<PlanModel | null> {
        return PlanSchema.findOneAndUpdate({ _id: _id }, planData, {
            new: true,
        }).exec();
    }

    async deleteById(planId: string): Promise<PlanModel | null> {
        try {
            const deletedplan = await PlanSchema.findByIdAndDelete(planId).exec();
            if (!deletedplan) {
                return null;
            }
            return deletedplan as unknown as PlanModel;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async findAll(): Promise<PlanModel[]> {
        return await PlanSchema.find().populate('billingType', 'name').exec();
    }

    async findMany(query: any): Promise<PlanModel[]> {
        try {
            const plans = await PlanSchema.find(query).populate('billingType', 'name').exec();
            return plans;
        } catch (error) {
            console.error(error);
            return [];
        }
    }
}
