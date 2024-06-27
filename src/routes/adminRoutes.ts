import * as express from 'express';
import { AdminController } from '../controllers/adminControllers';
import { Container } from 'typedi';
import { validate } from '../middleware/validation.middleware';
import { RegisterEmailPassValidate, EmailPassValidate, UpdatePassValidate, RegisterUserValidate, CreatorValidation } from '../validation/authValidation';
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
// router.route('/delete').delete([checkJWT], adminController.delete);
// router.route('/updatePassword').patch(validate('body', UpdatePassValidate), [checkJWT, AdminRoleCheck], adminController.updatePassword);


// //business category routes
// router.route('/createCategory').post([checkJWT, AdminRoleCheck], adminController.createBusinessCategory);
// router.route('/updateCategory/:id').patch([checkJWT, AdminRoleCheck], adminController.updateBusinessCategory);
// router.route('/deleteCategory/:id').delete([checkJWT, AdminRoleCheck], adminController.deleteBusinessCategory);


//business routes
router.route('/getAllBusiness').get([checkJWT, AdminRoleCheck], userController.getAllBusiness);
// router.route('/findBusiness/:id').get([checkJWT, AdminRoleCheck], userController.findUserById);
// router.route('/deleteBusiness/:id').patch([checkJWT, AdminRoleCheck], userController.deleteUser);
// router.route('/updateBusinessStatus/:id').patch([checkJWT, AdminRoleCheck], userController.updateStatus);
// router.route('/updateBusinessStatus').patch([checkJWT, AdminRoleCheck], userController.updateMultipleStatus);//new added tested works
// router.route('/registerBusiness').post([checkJWT, AdminRoleCheck], validate('body', RegisterUserValidate), userController.registerUser);
// router.route('/uploadpic/business/:id').post([checkJWT, AdminRoleCheck], userController.uploadImg);
router.route('/searchBusiness/:keyword').post([checkJWT, AdminRoleCheck], userController.searchBusiness);//new added tested works
// router.route('/businessStats').get([checkJWT, AdminRoleCheck], userController.getBusinessStats);//new added tested works


// //employee Routes
router.route('/getAllEmployee').get([checkJWT, AdminRoleCheck], adminController.getAllEmployee);
router.route('/getEmployee/:id').get([checkJWT, AdminRoleCheck], adminController.getEmployeeById);
router.route('/updateEmployeeStatus/:id').patch([checkJWT, AdminRoleCheck], adminController.updateEmployeeStatus);
// router.route('/updateEmployeeStatus').patch([checkJWT, AdminRoleCheck], adminController.updateMultipleEmployeeStatus);//new added tested works
router.route('/deleteEmployee/:id').patch([checkJWT, AdminRoleCheck], adminController.delete);
router.route('/assignBusiness/:employeeId').post([checkJWT, AdminRoleCheck], adminController.assignBusiness);
router.route('/uploadpic/:id').post([checkJWT, AdminRoleCheck], adminController.uploadImg);
router.route('/uploadpic').post([checkJWT], adminController.uploadImg);

router.route('/search/:keyword').post([checkJWT, AdminRoleCheck], adminController.search); //new added tested works
router.route('/employeeDetails').get([checkJWT], adminController.employeeDetailsWithBusiness);//new added tested works



// //creator Routes 
// router.route('/deleteCreator/:id').patch([checkJWT, AdminRoleCheck], creatorController.delete);
// router.route('/getCreator/:id').get([checkJWT, AdminRoleCheck], creatorController.getCreatorById);
// router.route('/allCreators').get([checkJWT, AdminRoleCheck], creatorController.getAllCreators);
// router.route('/addCreator').post([checkJWT, AdminRoleCheck], validate('body', CreatorValidation), creatorController.save);
// router.route('/updateCreatorStatus/:id').patch([checkJWT, AdminRoleCheck], creatorController.updateCreatorStatus);
// router.route('/updateCreatorStatus').patch([checkJWT, AdminRoleCheck], creatorController.updateMultipleCreatorStatus);
// //new added tested works
// router.route('/uploadpic/creator/:id').post([checkJWT, AdminRoleCheck], creatorController.uploadImg);
// router.route('/searchCreator/:keyword').post([checkJWT, AdminRoleCheck], creatorController.searchByName);//new added tested works
// router.route('/creatorStats').get([checkJWT, AdminRoleCheck], creatorController.getCreatorStats);//new added tested works


// //plan routes
// router.route('/addplan').post([checkJWT, AdminRoleCheck], planController.addPlan);
// router.route('/deleteplan/:id').delete([checkJWT, AdminRoleCheck], planController.deletePlan);
// router.route('/updateplan/:id').patch([checkJWT, AdminRoleCheck], planController.updatePlan);


// //subscriptionBilling routes
// router.route('/createSubcription').post([checkJWT, AdminRoleCheck], billingTypeController.createBillingType);
// router.route('/deleteSubcription/:id').delete([checkJWT, AdminRoleCheck], billingTypeController.deleteBillingType);
// router.route('/updateSubcription/:id').patch([checkJWT, AdminRoleCheck], billingTypeController.updateBillingType);
// router.route('/subscriptionStats').get([checkJWT, AdminRoleCheck], adminController.getSubcriptionDetails); //new added tested works



export { router as AdminRoutes };
