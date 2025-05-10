import CustomError from "../tools/customErrors/customError.js";
import TErrors from "../tools/customErrors/enum.js";


export default class UserGoalsController {
    constructor(usersGoalsRepository, usersRepository, goalRepository) {
        this.usersGoalsRepo = usersGoalsRepository;
        this.usersRepo = usersRepository;
        this.goalsRepo = goalRepository;
    }

    saveUserGoal = async (req, res, next) => {
        const { uid, gid } = req.params;
        try {
            const user = await this.usersRepo.getUserById(uid);
            if (!user) {
                CustomError.createError({
                    message: `Usuario ID ${uid} no encontrado.`,
                    code: TErrors.NOT_FOUND,
                });
            }
            const goal = await this.goalsRepo.getGoalById(gid);
            if (!goal) {
                CustomError.createError({
                    message: `Meta no encontrada.`,
                    code: TErrors.NOT_FOUND,
                });
            }
            const newUserGoal = await this.usersGoalsRepo.saveUserGoal(uid, gid);
            return res.status(200).send(newUserGoal)
            
        } catch (error) {
            next(error)
        }
    }

    getUserGoals = async (req, res, next) => {
        const { uid } = req.params;
        try {
            const user = await this.usersRepo.getUserById(uid);
            if (!user) {
                CustomError.createError({
                    message: `Usuario ID ${uid} no encontrado.`,
                    code: TErrors.NOT_FOUND,
                });
            }
            const userGoal = await this.usersGoalsRepo.getUserGoals(uid);
            if (!userGoal) {
                CustomError.createError({
                    message: `Meta no encontrada.`,
                    code: TErrors.NOT_FOUND,
                });
            }
            res.status(200).send(userGoal);
        } catch (error) {
            next(error)
        }
    }

    deleteUserGoal = async (req, res, next) => {
        const { gid } = req.params;
        try {
            const userGoal = await this.usersGoalsRepo.getUserGoalById(gid);
            if (!userGoal) {
                CustomError.createError({
                    message: `Meta de usuario no encontrada.`,
                    code: TErrors.NOT_FOUND,
                });
            }
            await this.usersGoalsRepo.deleteUserGoal(gid);
            res.status(200).send();
        } catch (error) {
            next(error)
        }
    }

    updateUserGoal = async (req, res, next) => {
        const { uid, gid, newDistance } = req.body;
        try {
            const userGoal = await this.goalsRepo.getGoalById(gid);
            if (!userGoal) {
                CustomError.createError({
                    message: `Meta de usuario no encontrada.`,
                    code: TErrors.NOT_FOUND,
                });
            }
            const user = await this.usersRepo.getUserById(uid);
            if (!user) {
                CustomError.createError({
                    message: `Usuario ID ${uid} no encontrado.`,
                    code: TErrors.NOT_FOUND,
                });
            }
            const message = await this.usersGoalsRepo.updateUserGoal(uid, gid, newDistance);
            res.status(200).send(message);
        } catch (error) {
            next(error)
        }
    }

    getUserGoalById = async (req, res, next) => {
        const { gid } = req.params;
        try {
            const userGoal = await this.usersGoalsRepo.getUserGoalById(gid);
            if (!userGoal) {
                CustomError.createError({
                    message: `Meta no encontrada.`,
                    code: TErrors.NOT_FOUND,
                });
            }
            res.status(200).send(userGoal);
        } catch (error) {
            next(error)
        }
    }


}