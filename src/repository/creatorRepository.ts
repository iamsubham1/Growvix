import { Service } from 'typedi';
import { CreatorModel, CreatorSchema } from '../models/creatorModel';

@Service()
export class CreatorRepository {

    async save(creator: CreatorModel): Promise<CreatorModel | null> {
        const creatorData = new CreatorSchema(creator);
        return new CreatorSchema(creatorData).save();
    }

    async update(creator: CreatorModel): Promise<CreatorModel | null> {
        return CreatorSchema.findOneAndUpdate({ _id: creator._id }, creator, {
            new: true,
        }).exec();
    }

    async updateById(_id: string, creatorData: Partial<CreatorModel>): Promise<CreatorModel | null> {
        return CreatorSchema.findOneAndUpdate({ _id: _id }, creatorData, {
            new: true,
        }).exec();
    }

    async findByEmail(email: string): Promise<CreatorModel | null> {
        return CreatorSchema.findOne({ email: email }).exec();
    }

    async deleteById(creatorId: string): Promise<CreatorModel | null> {
        try {
            const deletedCreator = await CreatorSchema.findByIdAndDelete(creatorId).exec();
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
        return CreatorSchema.findById(_id).exec();
    }
    async findAll(query: any): Promise<CreatorModel[]> {
        return CreatorSchema.find(query).exec();
    }

    async findByPhoneNumber(phoneNumber: string): Promise<CreatorModel | null> {
        return CreatorSchema.findOne({ phoneNumber: phoneNumber })
            .exec();
    }
}
