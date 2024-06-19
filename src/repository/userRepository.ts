import { UserModel, UserSchema } from '../models/userModel';
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

    async updateById(_id: string, userData: UserModel): Promise<UserModel | null> {
        return UserSchema.findOneAndUpdate({ _id: _id }, userData, {
            new: true,
        }).exec();
    }

    async findByEmail(email: string): Promise<UserModel | null> {
        return UserSchema.findOne({ email: email })
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

    async findByPhoneNumber(phoneNumber: string): Promise<UserModel | null> {
        return UserSchema.findOne({ phoneNumber: phoneNumber })
            .populate('subscription')
            .populate('businessCategory') // Add other fields you want to populate
            .exec();
    }
}
