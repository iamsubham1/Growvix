import * as express from 'express';
import { AuthController } from '../controllers/authController';
import { Container } from 'typedi';
import { validate } from '../middleware/validation.middleware';
import { RegisterUserValidate, EmailorNumberPassValidate } from '../validation/authValidation';
import { checkJWT } from '../middleware/auth.middleware';
import { GoogleAuthController } from '../controllers/googleAuthControllers';
import { FacebookAuthController } from '../controllers/facebookAuthControllers';
import { PlanController } from '../controllers/planControllers';
import { BillingTypeController } from '../controllers/billingTypeControllers';

import * as dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const authController = Container.get(AuthController);
const googleAuthController = Container.get(GoogleAuthController);
const facebookAuthController = Container.get(FacebookAuthController);
const planController = Container.get(PlanController);
const billingTypeController = Container.get(BillingTypeController);

// Routes for User Authentication
router.route('/registerUser').post(validate('body', RegisterUserValidate), authController.registerUser); 
router.route('/loginUser').post(validate('body', EmailorNumberPassValidate), authController.loginUser);
router.route('/updateUser').patch([checkJWT], authController.updateUser);
router.route('/deleteUser').delete([checkJWT], authController.deleteUser);
router.route('/findUser').post(authController.findUser);

//Business routes
router.route('/allCategories').get(authController.getAllBusinessCategory);

//Plan routes
router.route('/getplans').get(planController.getAllPlans);
router.route('/getplans/billingtype/:id').get(planController.getPlansByBillingType);
router.route('/getSubscriptions').get(billingTypeController.getAllBillingTypes);

// Google Authentication routes
router.get('/google', googleAuthController.initiateGoogleLogin);
router.get('/google/callback', googleAuthController.handleGoogleCallback);
router.get('/google/logout', googleAuthController.logout);

// Facebook Authentication routes
router.get('/facebook', facebookAuthController.initiateFacebookLogin);
router.get('/facebook/callback', facebookAuthController.handleFacebookCallback);
router.get('/facebook/logout', facebookAuthController.logout);

export { router as UserRoutes };
