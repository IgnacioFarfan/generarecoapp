import { Router } from "express";
import usersRouter from "./users.route.js";
import goalsRouter from "./goals.route.js";
import userGoalsRouter from "./usersGoals.route.js";
import sessionsRouter from "./sessions.route.js";
import levelsRouter from "./levels.route.js";
import medalsRouter from "./medals.route.js";

const router = Router();

// Add a simple health check endpoint
router.get("/api", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    message: "ok",
    version: "1.0.0"
  });
});

router.use("/api/users", usersRouter);
router.use("/api/goals", goalsRouter);
router.use("/api/usersgoals", userGoalsRouter);
router.use("/api/sessions", sessionsRouter);
router.use("/api/levels", levelsRouter);
router.use("/api/medals", medalsRouter);

export default router;
