import CustomError from "../tools/customErrors/customError.js";
import TErrors from "../tools/customErrors/enum.js";

export default class ProductsController {
    constructor(sessionsRepository, usersRepository) {
        this.sessionsRepo = sessionsRepository;
        this.usersRepo = usersRepository;
    }

    saveSession = async (req, res, next) => {
        try {
            // Log the entire request body for debugging
            console.log("Full request body:", JSON.stringify(req.body));
            
            const { uid, distance, speedAvg, heartRateAvg, calories, time } = req.body;
            
            // Validate required fields
            if (!uid) {
                console.error("Missing user ID in request");
                return res.status(400).json({ 
                    status: "error", 
                    message: "User ID is required" 
                });
            }
            
            // Log the parsed values
            console.log("Parsed values:", {
                uid, 
                distance: Number(distance), 
                speedAvg: Number(speedAvg),
                heartRateAvg: Number(heartRateAvg),
                calories: Number(calories),
                time: Number(time)
            });
            
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
                    await this.usersRepo.incrementTotalKilometers(uid, Number(distance) || 0);
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

    getUserStats = async (req, res, next) => {
        const { uid, periodType } = req.params;
        try {
            const user = await this.usersRepo.getUserById(uid);
            if (!user) {
                CustomError.createError({
                    message: `Usuario ID ${uid} no encontrado`,
                    code: TErrors.NOT_FOUND
                });
            }
            
            // Log the request parameters for debugging
            console.log(`Getting stats for user ${uid} with period ${periodType}`);
            
            let userStatsByPeriod = await this.sessionsRepo.getUserStats(uid, periodType);
            
            // Log the response for debugging
            console.log('Stats response:', userStatsByPeriod);
            
            res.status(200).send(userStatsByPeriod);
        } catch (error) {
            console.error('Error in getUserStats:', error);
            next(error);
        }
    }

    getUserTotalDistance = async (req, res, next) => {
        const { uid } = req.params;
        try {
            const user = await this.usersRepo.getUserById(uid);
            if (!user) {
                CustomError.createError({
                    message: `Usuario ID ${uid} no encontrado`,
                    code: TErrors.NOT_FOUND
                });
            }
            res.status(200).send({userTotalDistance: user.totalKilometers || 0});
        } catch (error) {
            next(error)
        }
    }

}
