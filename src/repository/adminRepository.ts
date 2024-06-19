import { AdminModel, AdminSchema } from '../models/adminModel';
import { Service } from 'typedi';

@Service()
export class AdminRepository {
    async save(user: AdminModel): Promise<AdminModel | null> {
        const userData = new AdminSchema(user);
        return new AdminSchema(userData).save();
    }
    async update(user: AdminModel): Promise<AdminModel | null> {
        return AdminSchema.findOneAndUpdate({ _id: user._id }, user, {
            new: true,
        }).exec();
    }
    async updateById(_id: string, userData: AdminModel): Promise<AdminModel | null> {
        return AdminSchema.findOneAndUpdate({ _id: _id }, userData, {
            new: true,
        }).exec();
    }
    async findByEmail(email: string): Promise<AdminModel | null> {
        return AdminSchema.findOne({ email: email }).exec();
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
}
