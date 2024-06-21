import { AdminModel, AdminSchema } from '../models/adminModel';
import { Service } from 'typedi';

@Service()
export class AdminRepository {
    async save(user: AdminModel): Promise<AdminModel | null> {
        const userData = new AdminSchema(user);
        return new AdminSchema(userData).save();
    }


    async updateById(_id: string, userData: Partial<AdminModel>): Promise<AdminModel | null> {
        return AdminSchema.findOneAndUpdate({ _id: _id }, userData, {
            new: true,
        }).exec();
    }

    async findByEmail(email: string): Promise<AdminModel | null> {
        return AdminSchema.findOne({ email: email }).exec();
    }
    async findById(_id: string): Promise<AdminModel | null> {
        return AdminSchema.findById({ _id: _id }).exec();
    }

    async deleteById(userId: string): Promise<AdminModel | null> {
        try {
            const deletedUser = await AdminSchema.findByIdAndDelete(userId).exec();
            if (!deletedUser) {
                return null;
            }
            return deletedUser as unknown as AdminModel;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async find(query: any): Promise<AdminModel[]> {
        return AdminSchema.find(query).exec();
    }

    async findOne(query: any): Promise<AdminModel> {
        return AdminSchema.findOne(query).exec();
    }

    async addBusinessToList(_id: string, businessId: string): Promise<AdminModel | null> {
        try {
            const updatedUser = await AdminSchema.findOneAndUpdate(
                { _id: _id },
                { $push: { businessList: businessId } },
                { new: true }
            ).exec();

            return updatedUser;
        } catch (error) {
            console.error("Error adding business to user's list:", error);
            return null;
        }
    }
}
