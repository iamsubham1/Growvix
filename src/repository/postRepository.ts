import { PostModel, PostSchema } from "../models/postModel";
import { Service } from "typedi";

@Service()
export class PostRepository {
    async save(post: PostModel): Promise<PostModel | null> {
        const postData = new PostSchema(post);
        return new PostSchema(postData).save()
    }

    async updateById(_id: string, updateData: Partial<PostModel>): Promise<PostModel | null> {
        return PostSchema.findOneAndUpdate({ _id: _id }, updateData, {
            new: true,
        }).exec();
    }

    async findById(_id: string): Promise<PostModel | null> {
        return PostSchema.findById({ _id: _id }).exec();
    }

    async deleteById(_id: string): Promise<PostModel | null> {
        try {
            const deletedPost = await PostSchema.findByIdAndDelete(_id).exec();
            if (!deletedPost) {
                return null;
            }
            return deletedPost as unknown as PostModel;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async findAll(): Promise<PostModel[] | null> {
        return PostSchema.find().exec();
    }
}