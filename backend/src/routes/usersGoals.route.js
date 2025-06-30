import { Router } from "express";
import UserGoalsController from "../controllers/userGoals.controller.js";
import { usersRepository, usersGoalsRepository, goalsRepository } from "../dao/repository/index.js"
import { handlePolicies } from "../middlewares/handlePolicies.js";
import { userPassJwt } from "../middlewares/userPassJwt.js";

const usersGoalsController = new UserGoalsController(usersGoalsRepository, usersRepository, goalsRepository);
const router = Router();

router.get("/getusergoals/:uid", userPassJwt(), handlePolicies(["PUBLIC"]), usersGoalsController.getUserGoals);
router.get("/getgoalslevelsmedals/:uid", userPassJwt(), handlePolicies(["PUBLIC"]), usersGoalsController.getGoalsLevelsMedals);
router.get("/getusermedalprogress/:uid", userPassJwt(), handlePolicies(["PUBLIC"]), usersGoalsController.getUserMedalProgress);
router.delete("/deleteusergoal/:uid/:gid", userPassJwt(), handlePolicies(["PUBLIC"]), usersGoalsController.deleteUserGoal);
router.get("/getusergoalstats/:uid/:ugid", userPassJwt(), handlePolicies(["PUBLIC"]), usersGoalsController.getUserGoalsStats);

router.post("/update-progress", userPassJwt(), handlePolicies(["PUBLIC"]), usersGoalsController.updateUserGoal);
router.post("/saveusergoal/:uid/:gid", userPassJwt(), handlePolicies(["PUBLIC"]), usersGoalsController.saveUserGoal);
router.get("/checkusergoalexist/:uid/:gid", userPassJwt(), handlePolicies(["PUBLIC"]), usersGoalsController.checkUserGoalExist);
router.put("/updatefinnishusergoal/:uid/:ugid/:date", userPassJwt(), handlePolicies(["PUBLIC"]), usersGoalsController.updateFinnishUserGoal);

export default router;
