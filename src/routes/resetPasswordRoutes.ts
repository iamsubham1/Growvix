import * as express from 'express';
import { Container } from 'typedi';
import { ResetPasswordController } from '../controllers/resetPasswordController';


const router = express.Router();
const resetPasswordController = Container.get(ResetPasswordController);


router.route('/reset').post(resetPasswordController.resetPasswordLinkAndOtp);
router.route('/verifyOtp').post(resetPasswordController.verifyOtp);

export { router as ResetPasswordRoutes };
