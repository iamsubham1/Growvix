import { UserModel, UserSchema, BusinessModel } from '../models/userModel';
import { Service } from 'typedi';

@Service()
export class UserRepository {

    async save(user: UserModel): Promise<UserModel | null> {
        const userData = new UserSchema(user);
        return new UserSchema(userData).save();
    }

    async update(user: UserModel): Promise<UserModel | null> {
        return UserSchema.findOneAndUpdate({ _id: user._id }, user, {
            new: true,
        }).exec();
    }

    async updateById(_id: string, updateData: Partial<UserModel>): Promise<UserModel | null> {
        return UserSchema.findOneAndUpdate({ _id: _id }, updateData, {
            new: true,
        }).exec();
    }

    async findByEmail(email: string): Promise<UserModel | null> {
        return UserSchema.findOne({ email: email, isDeleted: false })
            .populate('subscription')
            .populate('businessCategory') // Add other fields you want to populate
            .exec();
    }

    async deleteById(userId: string): Promise<UserModel | null> {
        try {
            const deletedUser = await UserSchema.findByIdAndDelete(userId).exec();
            if (!deletedUser) {
                return null;
            }
            return deletedUser as unknown as UserModel;
        } catch (error) {
            console.error(error);
            return null;
        }
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

    async findById(userId: string): Promise<UserModel | null> {
        try {
            const user = await UserSchema.findById(userId).exec();

            if (!user) {
                return null;
            }
            return user;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async findByPhoneNumber(phoneNumber: string): Promise<UserModel | null> {
        return UserSchema.findOne({ phoneNumber: phoneNumber, isDeleted: false })
            .populate('subscription')
            .populate('businessCategory') // Add other fields you want to populate
            .exec();
    }

    async findAll(query: any): Promise<UserModel[]> {

        return await UserSchema.find(query).exec();
    }

    async updateBusinessStatusId(_id: string, status: string): Promise<UserModel | null> {
        return await UserSchema.findOneAndUpdate({ _id: _id }, { status: status }, {
            new: true,
        }).exec();
    }

    async countTotalUsers(): Promise<number> {
        return UserSchema.countDocuments({ isDeleted: false }).exec();
    }

    async countNewUsersByDateRange(startDate: Date, endDate: Date): Promise<number> {
        return UserSchema.countDocuments({
            isDeleted: false,
            createdAt: { $gte: startDate, $lte: endDate }
        }).exec();
    }



}
