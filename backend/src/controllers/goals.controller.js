import CustomError from "../tools/customErrors/customError.js";
import TErrors from "../tools/customErrors/enum.js";

export default class GoalsController {
    constructor(repo, usersGoalsRepo) {
        this.goalsRepo = repo;
        this.usersGoalsRepo = usersGoalsRepo;
    }

    saveGoal = async (req, res, next) => {
        const { title, description, note, distance, time, icon } = req.body;
        try {
            if (!icon || !title || !description) {
                CustomError.createError({
                    message: `Datos no recibidos o inválidos.`,
                    code: TErrors.INVALID_TYPES,
                });
            }
            const newGoal = await this.goalsRepo.saveGoal({ title, description, note, distance, time, icon });
            res.status(200).send(newGoal);
        } catch (error) {
            next(error)
        }
    }

    getGoalById = async (req, res, next) => {
        const { gid } = req.params;
        try {
            const goal = await this.goalsRepo.getGoalById(gid);
            if (!goal) {
                CustomError.createError({
                    message: `Meta ID: ${gid} no encontrada.`,
                    code: TErrors.NOT_FOUND,
                });
            }
            res.status(200).send(goal);
        } catch (error) {
            next(error)
        }
    }

    getGoals = async (req, res, next) => {
        try {
            const goals = await this.goalsRepo.getGoals();
            res.status(200).send(goals);
        } catch (error) {
            next(error)
        }
    }

    getGoalsByUserLevel = async (req, res, next) => {
        const { uid } = req.params;
        
        try {
            if (!uid) {
                CustomError.createError({
                    message: `ID de usuario no recibido.`,
                    code: TErrors.INVALID_TYPES,
                });
            }
            const goalsByUserLevel = await this.goalsRepo.getGoalsByUserLevel(uid);// trae solamente los desafíos que coinciden con el rango del usuario y no terminados (finnish=null)
            res.status(200).send(goalsByUserLevel);
        } catch (error) {
            next(error)
        }
    }

    
    checkAndUpgradeUserLevel = async (req, res, next) => {
        const { userId } = req.params;
        try {
            if (!userId) {
                CustomError.createError({
                    message: `Faltan datos o están erróneos.`,
                    code: TErrors.INVALID_TYPES,
                });
            }
            
            const result = await this.goalsRepo.checkAndUpgradeUserLevel(userId);
            res.status(200).send(result);
        } catch (error) {
            next(error)
        }
    }


    updateGoal = async (req, res, next) => {
        const { gid, distance, speedAvg = null, time = null } = req.body;
        try {
            if (!gid || !distance) {
                CustomError.createError({
                    message: `Datos no recibidos o inválidos.`,
                    code: TErrors.INVALID_TYPES,
                });
            }
            const goal = await this.goalsRepo.getGoalById(gid);
            if (!goal) {
                CustomError.createError({
                    message: `Meta ID: ${gid} no encontrada.`,
                    code: TErrors.NOT_FOUND,
                });
            }
            const goalUpdated = await this.goalsRepo.updateGoal(gid, distance, speedAvg, time);
            res.status(200).send(goalUpdated);
        } catch (error) {
            next(error)
        }
    }

    deleteGoal = async (req, res, next) => {
        const { gid } = req.params;
        try {
            const goal = await this.goalsRepo.getGoalById(gid);
            if (!goal) {
                CustomError.createError({
                    message: `Meta ID: ${gid} no encontrada.`,
                    code: TErrors.NOT_FOUND,
                });
            }
            await this.goalsRepo.deleteGoal(gid);
            res.status(200).send();
        } catch (error) {
            next(error)
        }
    }

    assignGoalToUser = async (req, res, next) => {
        const { userId, goalId } = req.body;
        try {
            if (!userId || !goalId) {
                CustomError.createError({
                    message: `Datos no recibidos o inválidos.`,
                    code: TErrors.INVALID_TYPES,
                });
            }

            // Check if goal exists
            const goal = await this.goalsRepo.getGoalById(goalId);
            if (!goal) {
                CustomError.createError({
                    message: `Meta ID: ${goalId} no encontrada.`,
                    code: TErrors.NOT_FOUND,
                });
            }

            // Use the existing usersGoals repository to save the user goal
            // You'll need to inject this repository in the constructor
            const newUserGoal = await this.usersGoalsRepo.saveUserGoal(userId, goalId);
            res.status(200).send(newUserGoal);
        } catch (error) {
            next(error);
        }
    }

}
