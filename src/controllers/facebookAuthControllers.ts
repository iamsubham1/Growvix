import { Inject, Service } from 'typedi';
import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import axios from 'axios';
import { responseStatus } from '../helper/responses';
import { msg } from '../helper/messages';
import { UserService } from '../services/userService';

dotenv.config();

const APP_ID = process.env.FACEBOOK_APP_ID;
const APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const REDIRECT_URI = process.env.FACEBOOK_CALLBACK_URL;

@Service()
export class FacebookAuthController {
    constructor(@Inject() private userService: UserService) { }

    initiateFacebookLogin = (req: Request, res: Response) => {
        const scope = 'email';
        const responseType = 'code';
        const authType = 'rerequest';
        const display = 'popup';

        const params = new URLSearchParams({
            client_id: APP_ID,
            redirect_uri: REDIRECT_URI,
            scope,
            response_type: responseType,
            auth_type: authType,
            display: display,
        }).toString();

        const url = `https://www.facebook.com/v4.0/dialog/oauth?${params}`;
        return res.redirect(url);
    };

    handleFacebookCallback = async (req: Request, res: Response) => {
        const { code } = req.query;

        if (!code) {
            return responseStatus(res, 400, msg.common.invalidRequest, 'Authorization code is missing');
        }

        try {
            const tokenData = {
                client_id: APP_ID,
                client_secret: APP_SECRET,
                code: code as string,
                redirect_uri: REDIRECT_URI,
            };

            const tokenResponse = await axios.get('https://graph.facebook.com/v13.0/oauth/access_token', { params: tokenData });
            const { access_token } = tokenResponse.data;

            const profileResponse = await axios.get(`https://graph.facebook.com/v13.0/me`, {
                params: {
                    fields: 'name,email',
                    access_token,
                },
            });

            const profile = profileResponse.data;
            const user = await this.userService.findOrCreateUser(profile);

            return responseStatus(res, 200, msg.user.loggedInSuccess, {
                token: access_token,
                user,
            });
        } catch (error) {
            console.error('Error:', error.response?.data || error.message);
            return responseStatus(res, 500, msg.common.somethingWentWrong, 'An error occurred during Facebook authentication');
        }
    };

    logout = (req: Request, res: Response) => {
        // Code to handle user logout
        res.redirect('/login');
    };
}
