import { Router } from "express";
import MedalsController from "../controllers/medals.controller.js";
import { medalsRepository } from "../dao/repository/index.js"
import { handlePolicies } from "../middlewares/handlePolicies.js";
import { userPassJwt } from "../middlewares/userPassJwt.js";

const medalsController = new MedalsController(medalsRepository);
const router = Router();

router.get("/getmedals", userPassJwt(), handlePolicies(["PUBLIC"]), medalsController.getMedals);
router.post("/savemedal", userPassJwt(), handlePolicies(["PUBLIC"]), medalsController.saveMedal);
router.get("/getmedal/:mid", userPassJwt(), handlePolicies(["PUBLIC"]), medalsController.getMedalById);
router.put("/updatemedal/:mid", userPassJwt(), handlePolicies(["PUBLIC"]), medalsController.updateMedal);
router.delete("/deletemedal/:mid", userPassJwt(), handlePolicies(["PUBLIC"]), medalsController.deleteMedal);

export default router;
