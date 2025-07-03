import models from "../models/index.js"

export let usersRepository, goalsRepository, usersGoalsRepository, sessionsRepository, medalsRepository, levelsRepository;

const { default: usersDB } = await import("../repository/users.repository.js");
usersRepository = new usersDB(models.users);

const { default: goalsDB } = await import("../repository/goals.repository.js");
goalsRepository = new goalsDB(models.goals, models.userGoals, models.users);

const { default: userGoalsDB } = await import("../repository/usersGoals.repository.js");
usersGoalsRepository = new userGoalsDB(models.userGoals, models.sessions, models.goals, models.users, models.medals, models.levels);

const { default: sessionsDB } = await import("../repository/sessions.repository.js");
sessionsRepository = new sessionsDB(models.sessions);

const { default: medalsDB } = await import("../repository/medals.repository.js");
medalsRepository = new medalsDB(models.medals);

const { default: levelsDB } = await import("../repository/levels.repository.js");
levelsRepository = new levelsDB(models.levels);