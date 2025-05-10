import models from "../models/index.js"

export let usersRepository, goalsRepository, usersGoalsRepository, sessionsRepository;

const { default: usersDB } = await import("../repository/users.repository.js");
usersRepository = new usersDB(models.users);

const { default: goalsDB } = await import("../repository/goals.repository.js");
goalsRepository = new goalsDB(models.goals);

const { default: userGoalsDB } = await import("../repository/usersGoals.repository.js");
usersGoalsRepository = new userGoalsDB(models.userGoals);

const { default: sessionsDB } = await import("../repository/sessions.repository.js");
sessionsRepository = new sessionsDB(models.sessions);