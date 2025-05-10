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

router.post("/login", isSessionOn(), passportCall("login"), handlePolicies(["PUBLIC"]), usersController.userSigninOrLogin);
router.post("/signin", isSessionOn(), passportCall("signin"), handlePolicies(["PUBLIC"]), usersController.userSigninOrLogin);
router.get("/passrestoration/:email", isSessionOn(), handlePolicies(["PUBLIC"]), usersController.passRestoration);
router.post("/forgot", isSessionOn(), handlePolicies(["PUBLIC"]), usersController.userForgotPass);
router.get("/logout", isSessionOn(), handlePolicies(["PUBLIC"]), usersController.userLogout);
router.get("/facebook", isSessionOn(), passportCall("facebook"), handlePolicies(["PUBLIC"]), usersController.facebook);
router.get("/fbstrategy", isSessionOn(), passportCall("facebook"), handlePolicies(["PUBLIC"]), usersController.facebookStrategy);
router.get("/google", isSessionOn(), passportCall("google"), handlePolicies(["PUBLIC"]), usersController.google);
router.get("/gstrategy", isSessionOn(), passportCall("google"), handlePolicies(["PUBLIC"]), usersController.googleStrategy);
router.put("/avatar/:uid", userPassJwt(), handlePolicies(["PUBLIC"]), uploads.single("avatar"), usersController.updateUserAvatar);
router.get("/getusers", userPassJwt(), handlePolicies(["PUBLIC"]), usersController.getAllUsers);
router.put("/updateuserstatus/:uid", userPassJwt(), handlePolicies(["PUBLIC"]), usersController.updateUserStatus);
router.put("/updateuser", userPassJwt(), handlePolicies(["PUBLIC"]), usersController.updateUser);

export default router;