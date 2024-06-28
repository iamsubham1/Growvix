import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import axios from 'axios';
import { responseStatus } from '../helper/responses';
import { msg } from '../helper/messages';
import { Inject, Service } from 'typedi';
import { UserService } from '../services/userService';

dotenv.config();

const CLIENT_ID = process.env.GOOGLE_AUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_AUTH_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_CALLBACK_URL;

@Service()
export class GoogleAuthController {
    constructor(@Inject() private userService: UserService) { }

    initiateGoogleLogin = (req: Request, res: Response) => {
        if (!CLIENT_ID || !REDIRECT_URI) {
            console.error('Google OAuth environment variables are missing');
            return responseStatus(res, 500, msg.common.somethingWentWrong, '');
        }
        const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile email`;
        res.redirect(url);
    };

    handleGoogleCallback = async (req: Request, res: Response) => {
        const { code, error } = req.query;

        if (error) {
            console.error('Google OAuth error:', error);
            return res.redirect('http://localhost:3000'); // Redirect to the homepage
        }

        if (!code) {
            return responseStatus(res, 400, msg.auth.missingCode, '');
        }

        try {
            const tokenData = {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code,
                redirect_uri: REDIRECT_URI,
                grant_type: 'authorization_code',
            };

            const { data } = await axios.post('https://oauth2.googleapis.com/token', tokenData);

            const { access_token, id_token } = data;

            const { data: profile } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
                headers: { Authorization: `Bearer ${access_token}` },
            });

            const user = await this.userService.findOrCreateUser(profile);
            console.log(user.token)
            let responseData = {
                token: id_token,
                user,
            };

            if (user.existingUser) {
                res.redirect(`https://growvix.io/plan-business?user=${encodeURIComponent(JSON.stringify(responseData))}`);
            } else {
                res.redirect(`https://growvix.io/business-details?user=${encodeURIComponent(JSON.stringify(responseData))}`);
            }
        } catch (error) {
            console.error('Error:', error.response?.data || error.message);
            return responseStatus(res, 500, msg.common.somethingWentWrong, error);
        }
    };

    logout = (req: Request, res: Response) => {
        res.redirect('/login');
    };
}
