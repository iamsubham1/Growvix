import * as express from 'express';
import { UserController } from '../controllers/userController';
import { Container } from 'typedi';
import { validate } from '../middleware/validation.middleware';
import { RegisterUserValidate, EmailorNumberPassValidate, UpdatePassValidate } from '../validation/authValidation';
import { checkJWT } from '../middleware/auth.middleware';
import { GoogleAuthController } from '../controllers/googleAuthControllers';
import { FacebookAuthController } from '../controllers/facebookAuthControllers';
import { PlanController } from '../controllers/planControllers';
import { BillingTypeController } from '../controllers/billingTypeControllers';

import * as dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const userController = Container.get(UserController);
const googleAuthController = Container.get(GoogleAuthController);
const facebookAuthController = Container.get(FacebookAuthController);
const planController = Container.get(PlanController);
const billingTypeController = Container.get(BillingTypeController);

// Routes for User CRUD
router.route('/registerUser').post(validate('body', RegisterUserValidate), userController.registerUser);
router.route('/loginUser').post(validate('body', EmailorNumberPassValidate), userController.loginUser);
router.route('/updateUser').patch([checkJWT], userController.updateUser);
router.route('/deleteUser').delete([checkJWT], userController.deleteUser);
router.route('/updatePassword').patch(validate('body', UpdatePassValidate), [checkJWT], userController.updatePassword);//new added
router.route('/uploadpic').post([checkJWT], userController.uploadImg); //new added tested

//Business routes
router.route('/allCategories').get(userController.getAllBusinessCategory);

//Plan routes
router.route('/getplans/:userId?').get(planController.getAllPlans);
router.route('/getplans/billingtype/:id').get(planController.getPlansByBillingType);
router.route('/getSubscriptions').get(billingTypeController.getAllBillingTypes);

//Task Routes
router.route('/createTask').post([checkJWT], userController.createTask);//new added tested works
router.route('/getTasks').get([checkJWT], userController.getAllTasks);//new added tested works
router.route('/taskstats').get([checkJWT], userController.taskStats);//new added tested works
// Google Authentication routes
router.get('/google', googleAuthController.initiateGoogleLogin);
router.get('/google/callback', googleAuthController.handleGoogleCallback);
router.get('/google/logout', googleAuthController.logout);

// Facebook Authentication routes
router.get('/facebook', facebookAuthController.initiateFacebookLogin);
router.get('/facebook/callback', facebookAuthController.handleFacebookCallback);
router.get('/facebook/logout', facebookAuthController.logout);

export { router as UserRoutes };
