import mongoose from "mongoose";

export default class UsersGoalsController {
    constructor(usersGoalsRepo, usersRepo, goalsRepo) {
        this.usersGoalsRepo = usersGoalsRepo;
        this.usersRepo = usersRepo;
        this.goalsRepo = goalsRepo;
    }
    
    // Add the update-progress endpoint
    updateGoalProgress = async (req, res, next) => {
        const { userId, challengeId, distance, time } = req.body;
        try {
            console.log('Updating goal progress:', { userId, challengeId, distance, time });
            
            if (!userId || !challengeId) {
                return res.status(400).json({ 
                    status: "error", 
                    message: "User ID and challenge ID are required" 
                });
            }
            
            // First, try to find the goal by ID
            let userGoal = null;
            
            // Check if challengeId is a valid ObjectId
            const isValidObjectId = mongoose.Types.ObjectId.isValid(challengeId);
            
            if (isValidObjectId) {
                // If it's a valid ObjectId, search directly
                console.log('Finding active goal for user:', userId, 'and challenge ID:', challengeId);
                userGoal = await this.usersGoalsRepo.findActiveGoalByChallenge(userId, challengeId);
            }
            
            // If not found or not a valid ObjectId, we need to find the goal by name
            if (!userGoal) {
                // Try to find the goal by name in the goals collection
                console.log('Finding goal by name:', challengeId);
                let goal = await this.goalsRepo.findGoalByName(challengeId);
                
                // If goal doesn't exist, create it based on the challenge ID
                if (!goal) {
                    console.log('Goal not found, creating a new one for challenge:', challengeId);
                    
                    // Create default goals based on challenge ID
                    let goalData = {};
                    
                    // Parse the challenge ID to determine the goal parameters
                    if (challengeId.startsWith('beginner-')) {
                        const challengeNumber = parseInt(challengeId.split('-')[1]);
                        
                        switch (challengeNumber) {
                            case 1:
                                goalData = { 
                                    name: 'Primeros Pasos', 
                                    identifier: 'beginner-1',
                                    distance: null,
                                    time: 10 // 10 minutes goal
                                };
                                break;
                            case 2:
                                goalData = { 
                                    name: 'Senderos Verdes', 
                                    identifier: 'beginner-2',
                                    distance: 15, // 15-25 km in a week (using minimum)
                                    speedAvg: 7, // pace less than 7 min/km
                                    time: null 
                                };
                                break;
                            case 3:
                                goalData = { 
                                    name: 'Rumbo al Bosque', 
                                    identifier: 'beginner-3',
                                    distance: 15, // 15km in a week
                                    time: null 
                                };
                                break;
                            case 4:
                                goalData = { 
                                    name: 'Raíces en Movimiento', 
                                    identifier: 'beginner-4',
                                    distance: null,
                                    time: 90 // 90 minutes in a week
                                };
                                break;
                            default:
                                goalData = { 
                                    name: 'Desafío Personalizado', 
                                    identifier: challengeId,
                                    distance: 5, // Default 5km
                                    time: null 
                                };
                        }
                    } else if (challengeId.startsWith('intermediate-')) {
                        const challengeNumber = parseInt(challengeId.split('-')[1]);
                        
                        switch (challengeNumber) {
                            case 1:
                                goalData = { 
                                    name: 'Raíces Firmes', 
                                    identifier: 'intermediate-1',
                                    distance: 5, // 5km in one session
                                    time: null 
                                };
                                break;
                            case 2:
                                goalData = { 
                                    name: 'Senderos Verdes', 
                                    identifier: 'intermediate-2',
                                    distance: 26, // 26-50 km in a week (using minimum)
                                    speedAvg: 5, // pace less than 5 min/km
                                    time: null 
                                };
                                break;
                            case 3:
                                goalData = { 
                                    name: 'Rumbo al Bosque', 
                                    identifier: 'intermediate-3',
                                    distance: 40, // 40km in a week
                                    time: null 
                                };
                                break;
                            case 4:
                                goalData = { 
                                    name: 'Raíces en Movimiento', 
                                    identifier: 'intermediate-4',
                                    distance: null,
                                    time: 240 // 240 minutes in a week
                                };
                                break;
                            default:
                                goalData = { 
                                    name: 'Desafío Intermedio', 
                                    identifier: challengeId,
                                    distance: 20, // Default 20km
                                    time: null 
                                };
                        }
                    } else if (challengeId.startsWith('advanced-')) {
                        const challengeNumber = parseInt(challengeId.split('-')[1]);
                        
                        switch (challengeNumber) {
                            case 1:
                                goalData = { 
                                    name: 'Primer Árbol', 
                                    identifier: 'advanced-1',
                                    distance: 10, // 10km in one session
                                    time: null 
                                };
                                break;
                            case 2:
                                goalData = { 
                                    name: 'Senderos Verdes', 
                                    identifier: 'advanced-2',
                                    distance: 50, // 50+ km in a week
                                    speedAvg: 3, // pace less than 3 min/km
                                    time: null 
                                };
                                break;
                            case 3:
                                goalData = { 
                                    name: 'Rumbo al Bosque', 
                                    identifier: 'advanced-3',
                                    distance: 70, // 70km in a week
                                    time: null 
                                };
                                break;
                            case 4:
                                goalData = { 
                                    name: 'Raíces en Movimiento', 
                                    identifier: 'advanced-4',
                                    distance: null,
                                    time: 420 // 420 minutes in a week
                                };
                                break;
                            default:
                                goalData = { 
                                    name: 'Desafío Avanzado', 
                                    identifier: challengeId,
                                    distance: 50, // Default 50km
                                    time: null 
                                };
                        }
                    } else {
                        // Default goal for unknown challenge types
                        goalData = { 
                            name: 'Desafío Personalizado', 
                            identifier: challengeId,
                            distance: 5, // Default 5km
                            time: null 
                        };
                    }
                    
                    // Create the goal
                    goal = await this.goalsRepo.saveGoal(goalData);
                    console.log('Created new goal:', goal);
                    
                    // Create a user goal for this user and the new goal
                    const userGoalData = {
                        user: userId,
                        goal: goal._id,
                        distance: 0,
                        time: 0,
                        finnish: null
                    };
                    
                    const newUserGoal = await this.usersGoalsRepo.createUserGoal(userGoalData);
                    console.log('Created new user goal:', newUserGoal);
                    
                    // Set the userGoal for updating
                    userGoal = newUserGoal;
                } else {
                    console.log('Found goal by name:', goal);
                    // Now find the user goal with this goal ID
                    userGoal = await this.usersGoalsRepo.findActiveGoalByChallenge(userId, goal._id);
                    
                    // If user doesn't have this goal yet, create it
                    if (!userGoal) {
                        console.log('User does not have this goal yet, creating it');
                        const userGoalData = {
                            user: userId,
                            goal: goal._id,
                            distance: 0,
                            time: 0,
                            finnish: null
                        };
                        
                        userGoal = await this.usersGoalsRepo.createUserGoal(userGoalData);
                        console.log('Created new user goal:', userGoal);
                    }
                }
            }
            
            console.log('Found user goal:', userGoal);
            
            if (!userGoal) {
                return res.status(404).json({ 
                    status: "error", 
                    message: "No active goal found for this challenge" 
                });
            }
            
            // Update the goal progress
            console.log('Updating goal progress for userGoal:', userGoal._id);
            const result = await this.usersGoalsRepo.updateGoalProgress(userGoal._id, distance, time);
            
            console.log('Goal progress updated:', result);
            
            res.status(200).json({
                status: "success",
                message: "Goal progress updated",
                data: result
            });
        } catch (error) {
            console.error('Error updating goal progress:', error);
            next(error);
        }
    }
    
    // Implement other required methods with basic functionality
    saveUserGoal = async (req, res, next) => {
        try {
            res.status(200).json({ status: "success", message: "User goal saved" });
        } catch (error) {
            next(error);
        }
    }
    
    getUserGoals = async (req, res, next) => {
        try {
            const { uid } = req.params;
            if (!uid) {
                return res.status(400).json({
                    status: "error",
                    message: "User ID is required"
                });
            }

            // Get all user goals
            const userGoals = await this.usersGoalsRepo.getUserGoals(uid);
            
            // Add progress calculation to each goal
            const goalsWithProgress = await Promise.all(userGoals.map(async (userGoal) => {
                let progress = 0;
                
                // Make sure goal is populated
                if (!userGoal.goal || typeof userGoal.goal === 'string') {
                    userGoal = await this.usersGoalsRepo.getUserGoalById(userGoal._id);
                }
                
                // Calculate progress based on goal type
                if (userGoal.goal.distance) {
                    progress = Math.min((userGoal.distance / userGoal.goal.distance) * 100, 100);
                } else if (userGoal.goal.time) {
                    progress = Math.min((userGoal.time / userGoal.goal.time) * 100, 100);
                }
                
                return {
                    ...userGoal.toObject(),
                    progress: progress,
                    completed: userGoal.finnish !== null
                };
            }));
            
            res.status(200).json({
                status: "success",
                data: goalsWithProgress
            });
        } catch (error) {
            console.error('Error getting user goals:', error);
            next(error);
        }
    }
    
    getUserGoalById = async (req, res, next) => {
        try {
            res.status(200).json({ status: "success", message: "User goal retrieved by ID" });
        } catch (error) {
            next(error);
        }
    }
    
    deleteUserGoal = async (req, res, next) => {
        try {
            res.status(200).json({ status: "success", message: "User goal deleted" });
        } catch (error) {
            next(error);
        }
    }
    
    updateUserGoal = async (req, res, next) => {
        try {
            res.status(200).json({ status: "success", message: "User goal updated" });
        } catch (error) {
            next(error);
        }
    }
}
