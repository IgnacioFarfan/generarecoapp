import { Router } from "express";
import SessionsController from "../controllers/sessions.controller.js";
import  { sessionsRepository, usersRepository }  from "../dao/repository/index.js"
import { handlePolicies } from "../middlewares/handlePolicies.js";
import { userPassJwt } from "../middlewares/userPassJwt.js";

const sessionsController = new SessionsController(sessionsRepository, usersRepository);
const router = Router();

router.post("/savesession", userPassJwt(), handlePolicies(["PUBLIC"]), sessionsController.saveSession);
router.get("/getuserssessions/:uid", userPassJwt(), handlePolicies(["PUBLIC"]), sessionsController.getUserSessions);
router.get("/getuserstats/:uid/:periodType", userPassJwt(), handlePolicies(["PUBLIC"]), sessionsController.getUserStats);
router.get("/getusertotaldistance/:uid", userPassJwt(), handlePolicies(["PUBLIC"]), sessionsController.getUserTotalDistance);

export default router;