import * as express from 'express';
import { AdminController } from '../controllers/adminControllers';
import { Container } from 'typedi';
import { validate } from '../middleware/validation.middleware';
import { RegisterEmailPassValidate, EmailPassValidate, UpdatePassValidate, RegisterUserValidate } from '../validation/authValidation';
import { checkJWT, AdminRoleCheck } from '../middleware/auth.middleware';
import { PlanController } from '../controllers/planControllers';
import { BillingTypeController } from '../controllers/billingTypeControllers';
import { UserController } from '../controllers/userController';
import { CreatorController } from '../controllers/creatorControllers';



const router = express.Router();

const adminController = Container.get(AdminController);
const planController = Container.get(PlanController);
const billingTypeController = Container.get(BillingTypeController);
const userController = Container.get(UserController);
const creatorController = Container.get(CreatorController);


//admin routes
router.route('/register').post(validate('body', RegisterEmailPassValidate), adminController.registerAdmin);
router.route('/login').post(validate('body', EmailPassValidate), adminController.loginAdmin);
router.route('/update').patch([checkJWT], adminController.updateAdmin);
router.route('/delete').delete([checkJWT], adminController.deleteAdmin);
router.route('/updatePassword').patch(validate('body', UpdatePassValidate), [checkJWT, AdminRoleCheck], adminController.updatePassword);//new added

//business category routes
router.route('/createCategory').post([checkJWT, AdminRoleCheck], adminController.createBusinessCategory);
router.route('/updateCategory/:id').patch([checkJWT, AdminRoleCheck], adminController.updateBusinessCategory);
router.route('/deleteCategory/:id').delete([checkJWT, AdminRoleCheck], adminController.deleteBusinessCategory);

//business routes
router.route('/getAllBusiness').get([checkJWT, AdminRoleCheck], userController.getAllBusiness);//new added tested
router.route('/findBusiness/:id').get([checkJWT, AdminRoleCheck], userController.findUserById);//new added tested
router.route('/deleteBusiness/:id').patch([checkJWT, AdminRoleCheck], userController.deleteUser);//new added tested
router.route('/updateBusinessStatus/:id').patch([checkJWT, AdminRoleCheck], userController.updateStatus);//new added tested
router.route('/registerBusiness').post([checkJWT, AdminRoleCheck], validate('body', RegisterUserValidate), userController.registerUser); //new added tested
router.route('/uploadpic/business/:id').post([checkJWT, AdminRoleCheck], userController.uploadImg); //new added tested

//employee Routes
router.route('/getAllEmployee').get([checkJWT, AdminRoleCheck], adminController.getAllEmployee);//new added tested
router.route('/getEmployee/:id').get([checkJWT, AdminRoleCheck], adminController.getEmployeeById);//new added tested
router.route('/updateEmployeeStatus/:id').patch([checkJWT, AdminRoleCheck], adminController.updateEmployeeStatus);//new added tested
router.route('/deleteEmployee/:id').patch([checkJWT, AdminRoleCheck], adminController.deleteAdmin);//new added tested
router.route('/assignBusiness/:employeeId').post([checkJWT, AdminRoleCheck], adminController.assignBusiness);//new added tested
router.route('/uploadpic/:id').post([checkJWT, AdminRoleCheck], adminController.uploadImg); //new added tested

//creator Routes 
router.route('/deleteCreator/:id').patch([checkJWT, AdminRoleCheck], creatorController.delete);//new added tested
router.route('/getCreator/:id').get([checkJWT, AdminRoleCheck], creatorController.getCreatorById);//new added tested
router.route('/allCreators').get([checkJWT, AdminRoleCheck], creatorController.getAllCreators);//new added tested
router.route('/addCreator').post([checkJWT, AdminRoleCheck], creatorController.save);//new added tested tested (add validation)
router.route('/updateCreatorStatus/:id').patch([checkJWT, AdminRoleCheck], creatorController.updateCreatorStatus);//new added tested
router.route('/uploadpic/creator/:id').post([checkJWT, AdminRoleCheck], creatorController.uploadImg); //new added tested

//plan routes
router.route('/addplan').post([checkJWT, AdminRoleCheck], planController.addPlan);
router.route('/deleteplan/:id').delete([checkJWT, AdminRoleCheck], planController.deletePlan);
router.route('/updateplan/:id').patch([checkJWT, AdminRoleCheck], planController.updatePlan);

//subscriptionBilling routes
router.route('/createSubcription').post([checkJWT, AdminRoleCheck], billingTypeController.createBillingType);
router.route('/deleteSubcription/:id').delete([checkJWT, AdminRoleCheck], billingTypeController.deleteBillingType);
router.route('/updateSubcription/:id').patch([checkJWT, AdminRoleCheck], billingTypeController.updateBillingType);

export { router as AdminRoutes };
