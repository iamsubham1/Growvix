import { BillingTypeModel, BillingTypeSchema } from '../models/billingTypeModel';
import { Service } from 'typedi';

@Service()
export class BillingTypeRepository {
    async save(billingType: BillingTypeModel): Promise<BillingTypeModel | null> {
        const billingTypeData = new BillingTypeSchema(billingType);
        return new BillingTypeSchema(billingTypeData).save();
    }

    async updateById(_id: string, billingTypeData: BillingTypeModel): Promise<BillingTypeModel | null> {
        return BillingTypeSchema.findOneAndUpdate({ _id: _id }, billingTypeData, {
            new: true,
        }).exec();
    }

    async deleteById(billingTypeId: string): Promise<BillingTypeModel | null> {
        try {
            const deletedBillingType = await BillingTypeSchema.findByIdAndDelete(billingTypeId).exec();
            if (!deletedBillingType) {
                return null;
            }
            return deletedBillingType as unknown as BillingTypeModel;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async findAll(): Promise<BillingTypeModel[]> {
        return await BillingTypeSchema.find().exec();
    }
}
