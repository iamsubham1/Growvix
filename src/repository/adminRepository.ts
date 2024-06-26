import { AdminModel, AdminSchema } from '../models/adminModel';
import { Service } from 'typedi';


interface PopulateOptions {
    path: string;
    select?: string;
    populate?: PopulateOptions;
}

@Service()
export class AdminRepository {



    async save(user: AdminModel): Promise<AdminModel | null> {
        const userData = new AdminSchema(user);
        return new AdminSchema(userData).save();
    }


    async updateById(_id: string, updateData: Partial<AdminModel>): Promise<AdminModel | null> {
        return AdminSchema.findOneAndUpdate({ _id: _id }, updateData, {
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

    async findOne<Query>(query: Query): Promise<AdminModel> {
        return AdminSchema.findOne(query).exec();
    }

    async addBusinessesToList(_id: string, businessIds: string[]): Promise<AdminModel | null> {
        try {
            const updatedUser = await AdminSchema.findOneAndUpdate(
                { _id: _id },
                { $addToSet: { businessList: { $each: businessIds } } },
                { new: true }
            ).exec();

            return updatedUser;
        } catch (error) {
            console.error("Error adding businesses to user's list:", error);
            return null;
        }
    }

    async findAll<Query>(query: Query, skip?: number, limit?: number): Promise<AdminModel[]> {

        return await AdminSchema.find(query)
            .skip(skip)
            .limit(limit)
            .exec();
    }

    async findWithPopulate<Query>(query: Query, populate?: PopulateOptions[]): Promise<any | null> {
        try {
            let queryExec = AdminSchema.findOne(query);

            if (populate && populate.length > 0) {
                populate.forEach((pop) => {
                    queryExec = queryExec.populate(pop);
                });
            }

            const result = await queryExec.exec();
            return result;
        } catch (error) {
            console.error('Error in findWithPopulate:', error);
            throw error;
        }
    }

}
