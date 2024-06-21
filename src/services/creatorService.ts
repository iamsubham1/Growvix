import * as jwt from 'jsonwebtoken';
import { msg } from '../helper/messages';
import * as argon2 from 'argon2';
import { responseStatus } from '../helper/responses';
import { Request, Response } from 'express';
import { CreatorRepository } from '../repository/creatorRepository';
import { Inject, Service } from 'typedi';
import { jwtSignIN } from '../configuration/config';
import { CreatorModel } from '../models/creatorModel';
import * as dotenv from 'dotenv';
import sendEmailWithPassword from '../helper/sendMail';
import uploadImage from '../helper/uploadImage'; // Import the uploadImage function from your helper

dotenv.config();

@Service()
export class CreatorService {
    constructor(@Inject() private creatorRepository: CreatorRepository) { }

    private generatePassword(): string {
        const randomNumber = Math.floor(Math.random() * 10000);
        return `GrowVix@${randomNumber}`;
    }


    save = async (req: Request, res: Response) => {
        try {
            const creator: CreatorModel = req.body;
            if (!creator.email) {
                return responseStatus(res, 400, msg.user.emailRequired, null);
            }

            const existingCreator = await this.creatorRepository.findByEmail(creator.email);
            if (existingCreator) {
                return responseStatus(res, 400, msg.user.userEmailExist, null);
            }

            // Generate and hash password
            const generatedPassword = this.generatePassword();
            console.log(generatedPassword);
            creator.password = await argon2.hash(generatedPassword);
            creator.isDeleted = false;
            creator.status = "ACTIVE"

            // Save creator to database
            const newCreator = await this.creatorRepository.save(creator);
            if (!newCreator) {
                return responseStatus(res, 500, msg.user.errorInSaving, null);
            }

            // Send email with the auto-generated password

            await sendEmailWithPassword(creator.email, generatedPassword);



            const token = jwt.sign({ creatorId: newCreator._id }, jwtSignIN.secret);
            return responseStatus(res, 200, msg.user.userSavedSuccess, {
                token: token,
                creator: newCreator,
            });
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };

    getAllCreators = async (req: Request, res: Response) => {
        try {
            const allCreators = await this.creatorRepository.findAll({ isDeleted: false });
            return responseStatus(res, 200, msg.user.fetchedSuccessfully, allCreators);
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.user.fetchFailed, 'An unknown error occurred');
        }
    };

    getCreatorById = async (req: Request, res: Response) => {
        try {
            const creatorId = req.params.id;

            const creator = await this.creatorRepository.findById(creatorId);
            if (creator) {
                return responseStatus(res, 200, msg.user.userFound, creator);
            }
            return responseStatus(res, 200, msg.user.userNotFound, false);
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };

    updateCreatorStatus = async (req: Request & { user: any }, res: Response) => {
        try {
            const _id = req.params.id;
            if (!_id) {
                return responseStatus(res, 400, msg.common.invalidRequest, null);
            }
            const { status } = req.body;

            const updatedCreator = await this.creatorRepository.updateById(_id, { status });
            if (!updatedCreator) {
                return responseStatus(res, 404, msg.user.userNotFound, null);
            }

            return responseStatus(res, 200, 'creator status updated', updatedCreator);
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };
    // Soft delete by updating the isDeleted flag

    delete = async (req: Request, res: Response) => {
        try {
            const _id = req.params.id;
            if (!_id) {
                return responseStatus(res, 400, msg.common.invalidRequest, null);
            }

            const updatedCreator = await this.creatorRepository.updateById(_id, { isDeleted: true });
            if (!updatedCreator) {
                return responseStatus(res, 404, msg.user.userNotFound, null);
            }

            return responseStatus(res, 200, msg.user.userDeletedSuccess, {});
        } catch (error) {
            console.error(error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };


    uploadUserProfileImage = async (req: Request, res: Response) => {
        try {

            const userId = req.params.id;

            if (!userId) {
                return responseStatus(res, 400, msg.common.invalidRequest, null);
            }

            const secure_url = await uploadImage(req, res);

            if (secure_url) {
                const updateData = { avatar: secure_url };
                const updatedUser = await this.creatorRepository.updateById(userId, updateData);
                return responseStatus(res, 200, 'Uploaded successfully', updatedUser);
            } else {
                return responseStatus(res, 500, msg.common.somethingWentWrong, 'Failed to upload image');
            }

        } catch (error) {
            if (error.statusCode) {
                return responseStatus(res, error.statusCode, error.message, null);
            }
            console.error('Error uploading profile image:', error);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An unknown error occurred');
        }
    };
}
