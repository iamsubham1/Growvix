import { Request, Response } from 'express';
import { Service, Inject } from 'typedi';
import { CreatorService } from '../services/creatorService';

@Service()
export class CreatorController {
    constructor(
        @Inject() private creatorService: CreatorService) { }

    save = async (req: Request, res: Response) => {
        await this.creatorService.save(req, res);
    };

    getAllCreators = async (req: Request, res: Response) => {
        await this.creatorService.getAllCreators(req, res);
    };

    getCreatorById = async (req: Request, res: Response) => {
        await this.creatorService.getCreatorById(req, res);
    };

    updateCreatorStatus = async (req: Request & { user: any }, res: Response) => {
        await this.creatorService.updateCreatorStatus(req, res);
    };

    delete = async (req: Request, res: Response) => {
        await this.creatorService.delete(req, res);
    };

    uploadImg = async (req: Request, res: Response) => {

        await this.creatorService.uploadUserProfileImage(req, res);


    };
}
