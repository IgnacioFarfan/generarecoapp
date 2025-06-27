import { Router } from "express";
import LevelsController from "../controllers/levels.controller.js";
import { levelsRepository } from "../dao/repository/index.js"
import { handlePolicies } from "../middlewares/handlePolicies.js";
import { userPassJwt } from "../middlewares/userPassJwt.js";

const levelsController = new LevelsController(levelsRepository);
const router = Router();

router.get("/getlevels", userPassJwt(), handlePolicies(["PUBLIC"]), levelsController.getLevels);
router.post("/savelevel", userPassJwt(), handlePolicies(["PUBLIC"]), levelsController.saveLevel);
router.get("/getlevel/:lid", userPassJwt(), handlePolicies(["PUBLIC"]), levelsController.getLevelById);
router.put("/updatelevel/:lid", userPassJwt(), handlePolicies(["PUBLIC"]), levelsController.updateLevel);
router.delete("/deletelevel/:lid", userPassJwt(), handlePolicies(["PUBLIC"]), levelsController.deleteLevel);

export default router;
