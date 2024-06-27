import { AdminModel, UserModel, UserSchema } from '../models/userModel';
import { Service } from 'typedi';


interface PopulateOptions {
    path: string;
    select?: string;
    populate?: PopulateOptions;
}

@Service()
export class MainRepository {



    async save(user: UserModel): Promise<UserModel | null> {


        return new UserSchema(user).save();
    }


    async updateById(_id: string, updateData: Partial<UserModel>): Promise<UserModel | null> {
        console.log(updateData);
        return UserSchema.findOneAndUpdate({ _id: _id }, updateData, {
            new: true,
        }).exec();
    }

    async findByEmail(query: any): Promise<UserModel | null> {
        return UserSchema.findOne(query).exec();
    }

    async findById(_id: string): Promise<UserModel | null> {
        return UserSchema.findById({ _id: _id }).exec();
    }

    // async deleteById(userId: string): Promise<UserModel | null> {
    //     try {
    //         const deletedUser = await UserSchema.findByIdAndDelete(userId).exec();
    //         if (!deletedUser) {
    //             return null;
    //         }
    //         return deletedUser as unknown as AdminModel;
    //     } catch (error) {
    //         console.error(error);
    //         return null;
    //     }
    // }

    async findByPhoneNumber(phoneNumber: string): Promise<UserModel | null> {
        return UserSchema.findOne({ phoneNumber: phoneNumber, isDeleted: false })
            .populate('business.subscription')
            .populate('business.businessCategory')
            .exec();
    }

    async softDeleteById(_id: string): Promise<UserModel | null> {
        console.log(_id);
        try {
            const softDeletedUser = await UserSchema.findByIdAndUpdate(
                _id,
                { isDeleted: true },
                { new: true }
            ).exec();
            console.log(softDeletedUser);
            return softDeletedUser;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
    async findOne<Query>(query: Query): Promise<UserModel> {
        return UserSchema.findOne(query).exec();
    }

    async addBusinessesToList(_id: string, businessIds: string[]): Promise<UserModel | null> {
        try {
            const updatedUser = await UserSchema.findOneAndUpdate(
                { _id: _id },
                { $addToSet: { 'admin.businessList': { $each: businessIds } } },
                { new: true }
            ).exec();

            return updatedUser;
        } catch (error) {
            console.error("Error adding businesses to user's list:", error);
            return null;
        }
    }

    async findAll<Query>(query: Query, skip?: number, limit?: number): Promise<UserModel[]> {
        console.log(query);
        return await UserSchema.find(query)
            .skip(skip)
            .limit(limit)
            .exec();
    }

    async findWithPopulate<Query>(query: Query, populate?: PopulateOptions[]): Promise<any | null> {
        try {
            let queryExec = UserSchema.findOne(query);

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
