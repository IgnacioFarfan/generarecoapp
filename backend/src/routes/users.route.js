import { Router } from "express";
import UsersController from "../controllers/users.controller.js"
import  { usersRepository }  from "../dao/repository/index.js"
import { passportCall } from "../middlewares/passportCall.js";
import { handlePolicies } from "../middlewares/handlePolicies.js";
import { isSessionOn } from "../middlewares/isSessionOn.js";
import { userPassJwt } from "../middlewares/userPassJwt.js";
import { uploads } from "../middlewares/multer.js";

const usersController = new UsersController(usersRepository);
const router = Router();

router.post("/login", isSessionOn(), passportCall("login"), handlePolicies(["PUBLIC"]), usersController.userLogin);
router.post("/signin", isSessionOn(), passportCall("signin"), handlePolicies(["PUBLIC"]), usersController.userSignin);
router.post("/gstrategy", isSessionOn(), passportCall("google"), handlePolicies(["PUBLIC"]), usersController.userGoogleSigninOrLogin);
router.get("/logout", isSessionOn(), handlePolicies(["PUBLIC"]), usersController.userLogout);
router.get("/activateuser/:uid", isSessionOn(), handlePolicies(["PUBLIC"]), usersController.updateUserStatus);

router.get("/passrestoration/:uid/:hashedpass", isSessionOn(), handlePolicies(["PUBLIC"]), usersController.passRestoration);
router.post("/forgot", isSessionOn(), handlePolicies(["PUBLIC"]), usersController.userForgotPass);

router.get("/getusers", userPassJwt(), handlePolicies(["PUBLIC"]), usersController.getAllUsers);
router.get("/getuser/:uid", userPassJwt(), handlePolicies(["PUBLIC"]), usersController.getUser);
router.get("/getusertotaldistance/:uid", userPassJwt(), handlePolicies(["PUBLIC"]), usersController.getUserTotalDistance);
router.get("/getusermedal/:uid", userPassJwt(), handlePolicies(["PUBLIC"]), usersController.getUserMedal);

router.put("/avatar/:uid", userPassJwt(), handlePolicies(["PUBLIC"]), uploads.single("avatar"), usersController.updateUserAvatar);
router.put("/updateuserstatus/:uid", userPassJwt(), handlePolicies(["PUBLIC"]), usersController.updateUserStatus);
router.put("/updateuser", userPassJwt(), handlePolicies(["PUBLIC"]), usersController.updateUser);
router.put("/deactivateuser/:uid", userPassJwt(), handlePolicies(["PUBLIC"]), usersController.deactivateUser);
router.put("/updateusertotaldistance/:uid/:distance", userPassJwt(), handlePolicies(["PUBLIC"]), usersController.updateUserTotalKilometers);
router.put("/updateuserpassword", userPassJwt(), handlePolicies(["PUBLIC"]), usersController.updateUserPassword);
router.put("/updateusermedal/:uid/:medal", userPassJwt(), handlePolicies(["PUBLIC"]), usersController.updateUserMedal);

export default router;