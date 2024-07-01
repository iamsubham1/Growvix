import * as express from 'express';
import { Container } from 'typedi';
import { AdminController } from '../controllers/adminControllers';


import * as dotenv from 'dotenv';
import { checkJWT } from '../middleware/auth.middleware';

dotenv.config();

const router = express.Router();
const adminController = Container.get(AdminController);



// Routes for Business CRUD
router.route('/reset').post(adminController.resetPasswordLinkAndOtp);
router.route('/verifyOtp').post(adminController.verifyOtp);

export { router as ResetPasswordRoutes };
