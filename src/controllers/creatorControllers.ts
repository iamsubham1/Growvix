import { Request, Response } from 'express';
import { Service, Inject } from 'typedi';
import { CreatorService } from '../services/creatorService';
import { responseStatus } from '../helper/responses';
import { msg } from '../helper/messages';

@Service()
export class CreatorController {
    constructor(
        @Inject() private creatorService: CreatorService) { }

    save = async (req: Request, res: Response) => {
        try {
            await this.creatorService.save(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

    login = async (req: Request, res: Response) => {
        try {
            await this.creatorService.login(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

    updateUser = async (req: Request & { user: any }, res: Response) => {
        try {
            return await this.creatorService.updateAccount(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

    getAllCreators = async (req: Request, res: Response) => {
        try {
            await this.creatorService.getAllCreators(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

    getCreatorById = async (req: Request, res: Response) => {
        try {
            await this.creatorService.getCreatorById(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

    updateCreatorStatus = async (req: Request & { user: any }, res: Response) => {
        try {
            await this.creatorService.updateCreatorStatus(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };


    updateMultipleCreatorStatus = async (req: Request & { user: any }, res: Response) => {
        try {
            await this.creatorService.updateMultipleCreatorStatus(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

    delete = async (req: Request & { user: any }, res: Response) => {
        try {
            await this.creatorService.delete(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

    uploadCreatorImg = async (req: Request & { user: any }, res: Response) => {
        try {
            await this.creatorService.uploadCreatorProfileImage(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };


    updatePassword = async (req: Request & { user: any }, res: Response) => {
        try {

            return await this.creatorService.updatePassword(req, res);

        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

    searchByName = async (req: Request & { user: any }, res: Response) => {
        try {

            return await this.creatorService.searchByName(req, res);

        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

    getCreatorStats = async (req: Request & { user: any }, res: Response) => {
        try {
            return await this.creatorService.getCreatorStats(req, res);
        } catch (error) {
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    }
}
