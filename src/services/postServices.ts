import { Inject, Service } from 'typedi';
import { Request, Response } from 'express';
import { responseStatus } from '../helper/responses';
import { msg } from '../helper/messages';
import { PostRepository } from '../repository/postRepository';
import { PostModel } from '../models/postModel';

@Service()
export class PlanService {
    constructor(
        @Inject() private postRepository: PostRepository,
    ) { }

    addPost = async (req: Request & { user: any }, res: Response) => {
        try {
            const userId = req.user?.userId;
            const postData: PostModel = {
                ...req.body,
                userId: userId
            }

            const newPost = await this.postRepository.save(postData);
            if (!newPost) {
                return responseStatus(res, 500, msg.post.failed, null);
            }
            return responseStatus(res, 200, msg.post.success, newPost);
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };

    updatePost = async (req: Request, res: Response) => {
        try {
            const postId = req.params.id;
            const updatedPostData: PostModel = req.body;
            const updatedPost = await this.postRepository.updateById(postId, updatedPostData);
            if (!updatedPost) {
                return responseStatus(res, 404, msg.post.notFound, null);
            }
            return responseStatus(res, 200, msg.post.updateSuccess, updatedPost);
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.post.updateFailed, 'An unknown error occurred');
        }
    };

    deletePost = async (req: Request, res: Response) => {
        try {
            const postId = req.params.id;
            const deletedPost = await this.postRepository.deleteById(postId);
            if (!deletedPost) {
                return responseStatus(res, 404, msg.post.notFound, null);
            }
            return responseStatus(res, 200, msg.post.deleteSuccess, deletedPost);
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.post.deleteError, 'An unknown error occurred');
        }
    };

    getAllPosts = async (req: Request & { user: any }, res: Response) => {
        try {
            const posts = await this.postRepository.findAll();
            return responseStatus(res, 200, msg.post.fetchedSuccess, posts);
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.post.fetchFailed, 'An unknown error occurred');
        }
    };
}
