import { Router } from "express";
import UsersGoalsController from "../controllers/usersGoals.controller.js";
import { usersRepository, usersGoalsRepository, goalsRepository } from "../dao/repository/index.js"
import { handlePolicies } from "../middlewares/handlePolicies.js";
import { userPassJwt } from "../middlewares/userPassJwt.js";

const usersGoalsController = new UsersGoalsController(usersGoalsRepository, usersRepository, goalsRepository);
const router = Router();

// Add the getUserGoals endpoint
router.get("/getusergoals/:uid", userPassJwt(), handlePolicies(["PUBLIC"]), usersGoalsController.getUserGoals);

// Add the update-progress endpoint
router.post("/update-progress", userPassJwt(), handlePolicies(["PUBLIC"]), usersGoalsController.updateGoalProgress);

export default router;
