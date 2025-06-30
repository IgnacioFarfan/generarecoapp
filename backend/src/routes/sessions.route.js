import { Router } from "express";
import SessionsController from "../controllers/sessions.controller.js";
import  { sessionsRepository, usersRepository }  from "../dao/repository/index.js"
import { handlePolicies } from "../middlewares/handlePolicies.js";
import { userPassJwt } from "../middlewares/userPassJwt.js";

const sessionsController = new SessionsController(sessionsRepository, usersRepository);
const router = Router();

router.post("/savesession", userPassJwt(), handlePolicies(["PUBLIC"]), sessionsController.saveSession);
router.get("/getuserssessions/:uid", userPassJwt(), handlePolicies(["PUBLIC"]), sessionsController.getUserSessions);
router.get("/getuserstats/:uid/:period", userPassJwt(), handlePolicies(["PUBLIC"]), sessionsController.getUserStatsByPeriod);

router.get("/getusertotaltime/:uid", userPassJwt(), handlePolicies(["PUBLIC"]), sessionsController.getUserTotalTime);
router.get("/getusertotalvelocity/:uid", userPassJwt(), handlePolicies(["PUBLIC"]), sessionsController.getUserTotalVelocity);
router.get("/getusertotalsessions/:uid", userPassJwt(), handlePolicies(["PUBLIC"]), sessionsController.getUserTotalSessions);
router.get("/getusertotalkmts/:uid", userPassJwt(), handlePolicies(["PUBLIC"]), sessionsController.getUserTotalKmts);

router.get("/getuserdatadistance/:uid/:period", userPassJwt(), handlePolicies(["PUBLIC"]), sessionsController.getUserDataDistance);
router.get("/getuserdatatime/:uid/:period", userPassJwt(), handlePolicies(["PUBLIC"]), sessionsController.getUserDataTime);
router.get("/getuserdataspeedavg/:uid/:period", userPassJwt(), handlePolicies(["PUBLIC"]), sessionsController.getUserDataSpeedAvg);

router.get("/getuserdatacontribution/:uid/:period", userPassJwt(), handlePolicies(["PUBLIC"]), sessionsController.getUserPeriodContributionData);


export default router;