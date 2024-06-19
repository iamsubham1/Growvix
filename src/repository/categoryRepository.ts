import { BusinessCategoryModel, BusinessCategorySchema } from '../models/businessCategoryModel';
import { Service } from 'typedi';

@Service()
export class BusinessCategoryRepository {
    async save(category: BusinessCategoryModel): Promise<BusinessCategoryModel | null> {
        const categoryData = new BusinessCategorySchema(category);
        return await categoryData.save();
    }

    async update(category: BusinessCategoryModel): Promise<BusinessCategoryModel | null> {
        return await BusinessCategorySchema.findOneAndUpdate({ _id: category._id }, category, { new: true }).exec();
    }

    async updateById(_id: string, categoryData: BusinessCategoryModel): Promise<BusinessCategoryModel | null> {
        return await BusinessCategorySchema.findOneAndUpdate({ _id }, categoryData, { new: true }).exec();
    }

    async findByName(name: string): Promise<BusinessCategoryModel | null> {
        return await BusinessCategorySchema.findOne({ name }).exec();
    }

    async findAll(): Promise<BusinessCategoryModel[]> {
        return await BusinessCategorySchema.find().exec();
    }

    async deleteById(categoryId: string): Promise<BusinessCategoryModel | null> {
        const deletedCategory = await BusinessCategorySchema.findByIdAndDelete(categoryId).exec();
        return deletedCategory;
    }
}
