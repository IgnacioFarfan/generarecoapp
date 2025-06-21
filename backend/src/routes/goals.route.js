import { Router } from "express";
import GoalsController from "../controllers/goals.controller.js";
import { goalsRepository, usersGoalsRepository } from "../dao/repository/index.js"
import { handlePolicies } from "../middlewares/handlePolicies.js";
import { userPassJwt } from "../middlewares/userPassJwt.js";

const goalsController = new GoalsController(goalsRepository, usersGoalsRepository)
const router = Router();

router.post("/savegoal", userPassJwt(), handlePolicies(["PUBLIC"]), goalsController.saveGoal);
router.get("/getgoalbyid/:gid", userPassJwt(), handlePolicies(["PUBLIC"]), goalsController.getGoalById);
router.get("/getgoalsbyuserlevel/:uid", userPassJwt(), handlePolicies(["PUBLIC"]), goalsController.getGoalsByUserLevel);
router.get("/getgoals", userPassJwt(), handlePolicies(["PUBLIC"]), goalsController.getGoals);
router.put("/updategoal", userPassJwt(), handlePolicies(["PUBLIC"]), goalsController.updateGoal);
router.delete("/deletegoal/:gid", userPassJwt(), handlePolicies(["PUBLIC"]), goalsController.deleteGoal);
router.post("/assigngoaltouser", userPassJwt(), handlePolicies(["PUBLIC"]), goalsController.assignGoalToUser);
router.put("/checkandupgradeuserlevel/:userId", userPassJwt(), handlePolicies(["PUBLIC"]), goalsController.checkAndUpgradeUserLevel);

export default router;
