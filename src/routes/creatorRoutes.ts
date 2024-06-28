import * as express from 'express';
import { CreatorController } from '../controllers/creatorControllers';
import { Container } from 'typedi';
import { validate } from '../middleware/validation.middleware';
import { UpdatePassValidate, CreatorValidation, EmailorNumberPassValidate } from '../validation/authValidation';
import { checkJWT } from '../middleware/auth.middleware';




const router = express.Router();

const creatorController = Container.get(CreatorController);


router.route('/register').post(validate('body', CreatorValidation), creatorController.save);
router.route('/login').post(validate('body', EmailorNumberPassValidate), creatorController.login);
router.route('/update').patch([checkJWT], creatorController.updateUser);
router.route('/delete').patch([checkJWT], creatorController.delete);
// router.route('/uploadPic').post([checkJWT], creatorController.uploadImg);
router.route('/updatePassword').patch(validate('body', UpdatePassValidate), [checkJWT], creatorController.updatePassword);





export { router as CreatorRoutes };
