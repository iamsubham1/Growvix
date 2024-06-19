import * as express from 'express';
import { AdminController } from '../controllers/adminControllers';
import { Container } from 'typedi';
import { validate } from '../middleware/validation.middleware';
import { RegisterEmailPassValidate, EmailPassValidate } from '../validation/authValidation';
import { checkJWT, AdminRoleCheck } from '../middleware/auth.middleware';
import { PlanController } from '../controllers/planControllers';
import { BillingTypeController } from '../controllers/billingTypeControllers';

const router = express.Router();

const adminController = Container.get(AdminController);
const planController = Container.get(PlanController);
const billingTypeController = Container.get(BillingTypeController);

//admin routes
router.route('/register').post(validate('body', RegisterEmailPassValidate), adminController.registerAdmin);
router.route('/login').post(validate('body', EmailPassValidate), adminController.loginAdmin);
router.route('/update').patch([checkJWT], adminController.updateAdmin);
router.route('/delete').delete([checkJWT], adminController.deleteAdmin);

//business category routes
router.route('/createCategory').post([checkJWT, AdminRoleCheck], adminController.createBusinessCategory);
router.route('/updateCategory/:id').patch([checkJWT, AdminRoleCheck], adminController.updateBusinessCategory);
router.route('/deleteCategory/:id').delete([checkJWT, AdminRoleCheck], adminController.deleteBusinessCategory);

//plan routes
router.route('/addplan').post([checkJWT, AdminRoleCheck], planController.addPlan);
router.route('/deleteplan/:id').delete([checkJWT, AdminRoleCheck], planController.deletePlan);
router.route('/updateplan/:id').patch([checkJWT, AdminRoleCheck], planController.updatePlan);

//subscriptionBilling routes
router.route('/createSubcription').post([checkJWT, AdminRoleCheck], billingTypeController.createBillingType);
router.route('/deleteSubcription/:id').delete([checkJWT, AdminRoleCheck], billingTypeController.deleteBillingType);
router.route('/updateSubcription/:id').patch([checkJWT, AdminRoleCheck], billingTypeController.updateBillingType);

export { router as AdminRoutes };
