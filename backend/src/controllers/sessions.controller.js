import CustomError from "../tools/customErrors/customError.js";
import TErrors from "../tools/customErrors/enum.js";

export default class ProductsController {
    constructor(sessionsRepository, usersRepository) {
        this.sessionsRepo = sessionsRepository;
        this.usersRepo = usersRepository;
    }

    saveSession = async (req, res, next) => {
        try {
            const { uid, distance, speedAvg, heartRateAvg, calories, time } = req.body;

            if (!uid) {
                CustomError.createError({
                    message: `Usuario ID ${uid} no encontrado`,
                    code: TErrors.NOT_FOUND
                });
            }

            try {
                // Convert values to numbers and ensure they're valid
                const newSession = await this.sessionsRepo.saveSession(
                    uid,
                    Number(distance) || 0,
                    Number(speedAvg) || 0,
                    Number(heartRateAvg) || 0,
                    Number(calories) || 0,
                    Number(time) || 0
                );

                console.log("Session saved successfully:", newSession);

                // Update user's total kilometers
                try {
                    await this.usersRepo.updateUserTotalKilometers(uid, Number(distance) || 0);
                    console.log("User total kilometers updated");
                } catch (userError) {
                    console.error("Error updating user kilometers:", userError);
                    // Continue even if updating user kilometers fails
                }

                return res.status(201).send({ status: "success", payload: newSession });
            } catch (repoError) {
                console.error("Error in repository:", repoError);
                return res.status(500).json({
                    status: "error",
                    message: "Error saving session in repository",
                    error: repoError.message
                });
            }
        } catch (error) {
            console.error("Unexpected error in saveSession:", error);
            return res.status(500).json({
                status: "error",
                message: "Unexpected error processing request",
                error: error.message
            });
        }
    }

    getUserSessions = async (req, res, next) => {
        const { uid } = req.params;
        try {
            const user = await this.usersRepo.getUserById(uid);
            if (!user) {
                CustomError.createError({
                    message: `Usuario ID ${uid} no encontrado`,
                    code: TErrors.NOT_FOUND
                });
            }

            // Get the last 3 sessions for this user
            let userSessions = await this.sessionsRepo.getUserSessions(uid, 3);


            res.status(200).send(userSessions);
        } catch (error) {
            next(error)
        }
    }

    getUserStatsByPeriod = async (req, res, next) => {
        const { uid, period } = req.params;
        try {
            const user = await this.usersRepo.getUserById(uid);
            if (!user) {
                CustomError.createError({
                    message: `Usuario ID ${uid} no encontrado`,
                    code: TErrors.NOT_FOUND
                });
            }

            // Log the request parameters for debugging
            console.log(`Getting stats for user ${uid} with period ${period}`);

            let userStatsByPeriod = await this.sessionsRepo.getUserStatsByPeriod(uid, period);

            // Log the response for debugging
            console.log('Stats response:', userStatsByPeriod);

            res.status(200).send(userStatsByPeriod);
        } catch (error) {
            console.error('Error in getUserStats:', error);
            next(error);
        }
    }


    getUserTotalTime = async (req, res, next) => {
        const { uid } = req.params;
        try {
            if (!uid) {
                CustomError.createError({
                    message: `Faltan datos o están erróneos.`,
                    code: TErrors.INVALID_TYPES,
                });
            }
            const userTotalTime = await this.sessionsRepo.getUserTotalTime(uid);
            res.status(200).send({ userTotalTime: userTotalTime })
        } catch (error) {
            next(error)
        }
    }

    getUserTotalVelocity = async (req, res, next) => {
        const { uid } = req.params;
        try {
            if (!uid) {
                CustomError.createError({
                    message: `Faltan datos o están erróneos.`,
                    code: TErrors.INVALID_TYPES,
                });
            }
            const userTotalVelocity = await this.sessionsRepo.getUserTotalVelocity(uid);
            res.status(200).send({ userTotalVelocity: userTotalVelocity })
        } catch (error) {
            next(error)
        }
    }

    getUserTotalSessions = async (req, res, next) => {
        const { uid } = req.params;
        try {
            if (!uid) {
                CustomError.createError({
                    message: `Faltan datos o están erróneos.`,
                    code: TErrors.INVALID_TYPES,
                });
            }
            const userTotalSessions = await this.sessionsRepo.getUserTotalSessions(uid);
            res.status(200).send({ userTotalSessions: userTotalSessions })
        } catch (error) {
            next(error)
        }
    }

    getUserTotalKmts = async (req, res, next) => {
        const { uid } = req.params;
        try {
            if (!uid) {
                CustomError.createError({
                    message: `Faltan datos o están erróneos.`,
                    code: TErrors.INVALID_TYPES,
                });
            }
            const userTotalKmts = await this.sessionsRepo.getUserTotalKmts(uid);
            res.status(200).send({userTotalKmts: userTotalKmts})
        } catch (error) {
            next(error)
        }
    }

    getUserDataSpeedAvg = async (req, res, next) => {
        const { uid, period } = req.params;
        try {
            if (!uid || !period) {
                CustomError.createError({
                    message: `Faltan datos o están erróneos.`,
                    code: TErrors.INVALID_TYPES,
                });
            }
            const userData = await this.sessionsRepo.getUserDataSpeedAvg(uid, period);
            res.status(200).send(userData)
        } catch (error) {
            next(error)
        }
    }

    getUserDataTime = async (req, res, next) => {
        const { uid, period } = req.params;
        try {
            if (!uid || !period) {
                CustomError.createError({
                    message: `Faltan datos o están erróneos.`,
                    code: TErrors.INVALID_TYPES,
                });
            }
            const userData = await this.sessionsRepo.getUserDataTime(uid, period);
            res.status(200).send(userData)
        } catch (error) {
            next(error)
        }
    }

    getUserDataDistance = async (req, res, next) => {
        const { uid, period } = req.params;
        try {
            if (!uid || !period) {
                CustomError.createError({
                    message: `Faltan datos o están erróneos.`,
                    code: TErrors.INVALID_TYPES,
                });
            }
            const userData = await this.sessionsRepo.getUserDataDistance(uid, period);
            res.status(200).send(userData)
        } catch (error) {
            next(error)
        }
    }

    getUserPeriodContributionData = async (req, res, next) => {
        const { uid, period } = req.params;
        try {
            if (!uid || !period) {
                CustomError.createError({
                    message: `Faltan datos o están erróneos.`,
                    code: TErrors.INVALID_TYPES,
                });
            }
            const userData = await this.sessionsRepo.getUserPeriodContributionData(uid, period);
            res.status(200).send(userData)
        } catch (error) {
            next(error)
        }
    }

}
