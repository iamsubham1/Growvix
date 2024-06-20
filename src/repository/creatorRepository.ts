import { Service } from 'typedi';
import { CreatorModel, Creator } from '../models/creatorModel';

@Service()
export class CreatorRepository {
    async save(creator: CreatorModel): Promise<CreatorModel | null> {
        const creatorData = new Creator(creator);
        return new Creator(creatorData).save();
    }

    async update(creator: CreatorModel): Promise<CreatorModel | null> {
        return Creator.findOneAndUpdate({ _id: creator._id }, creator, {
            new: true,
        }).exec();
    }

    async updateById(_id: string, creatorData: Partial<CreatorModel>): Promise<CreatorModel | null> {
        return Creator.findOneAndUpdate({ _id: _id }, creatorData, {
            new: true,
        }).exec();
    }

    async findByEmail(email: string): Promise<CreatorModel | null> {
        return Creator.findOne({ email: email }).exec();
    }

    async deleteById(creatorId: string): Promise<CreatorModel | null> {
        try {
            const deletedCreator = await Creator.findByIdAndDelete(creatorId).exec();
            if (!deletedCreator) {
                return null;
            }
            return deletedCreator as unknown as CreatorModel;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async findById(_id: string): Promise<CreatorModel | null> {
        return Creator.findById(_id).exec();
    }

    async findAll(): Promise<CreatorModel[]> {
        return Creator.find().exec();
    }
}
