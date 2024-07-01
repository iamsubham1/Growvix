import { ResetPasswordModel, ResetPasswordSchema } from "../models/resetPasswordModel";
import { Service } from "typedi";

@Service()
export class ResetPasswordRepository {

    async save(data: ResetPasswordModel): Promise<ResetPasswordModel | null> {

        return new ResetPasswordSchema(data).save()
    };

    async updateById(_id: string, updateData: Partial<ResetPasswordModel>): Promise<ResetPasswordModel | null> {
        return ResetPasswordSchema.findOneAndUpdate({ _id: _id }, updateData, {
            new: true,
        }).exec();
    };

    async findById(_id: string): Promise<ResetPasswordModel | null> {
        return ResetPasswordSchema.findById({ _id: _id }).exec();
    };

    async delete(query: any): Promise<ResetPasswordModel | null> {
        try {
            const deletedPost = await ResetPasswordSchema.findOneAndDelete(query).exec();
            if (!deletedPost) {
                return null;
            }
            return deletedPost as unknown as ResetPasswordModel;
        } catch (error) {
            console.error(error);
            return null;
        }
    };

    async findOne(query: any): Promise<ResetPasswordModel | null> {
        return ResetPasswordSchema.findOne(query).exec();
    };
}