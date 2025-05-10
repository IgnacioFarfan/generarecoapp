import mongoose from "mongoose";

export default class UsersGoalsRepository {
    constructor(model) {
        this.usersGoalsModel = model;
    }

    async saveUserGoal(uid, gid) {
        try {
            let newUserGoal = new this.usersGoalsModel({ user: uid, goal: gid }).save();
            return newUserGoal;
        } catch (error) {
            throw error;
        }
    };
    
    async getUserGoals(userId) {
        try {
            return await this.usersGoalsModel.find({ user: userId }).populate('goal');
        } catch (error) {
            console.error('Error getting user goals:', error);
            throw error;
        }
    }

    async getUserGoalById(userGoalId) {
        try {
            return await this.usersGoalsModel.findById(userGoalId).populate('goal');
        } catch (error) {
            console.error('Error getting user goal by ID:', error);
            throw error;
        }
    }

    async deleteUserGoal(gid) {
        try {
            await this.usersGoalsModel.findByIdAndDelete(gid);
            return;
        } catch (error) {
            throw error;
        }
    };

    updateUserGoal = async (uid, gid, newDistance) => {
        const userGoal = await this.usersGoalsModel.findOne({
            user: uid,
            goal: gid,
            finnish: null
        }).populate("goal");
        
        const updatedDistance = (userGoal.distance === null ? 0 : userGoal.distance) + newDistance;
        const updateData = { distance: updatedDistance };
    
        if (updatedDistance >= userGoal.goal.distance) {
            updateData.finnish = new Date();
        }
    
        await this.usersGoalsModel.updateOne(
            { _id: userGoal._id },
            { $set: updateData }
        );
    
        return {
            message: updatedDistance >= userGoal.goal.distance
                ? "Objetivo completado con éxito"
                : "Distancia actualizada, pero aún falta para la meta",
            updatedDistance
        };
    };

    async findActiveGoalByChallenge(userId, challengeId) {
        try {
            console.log('Finding active goal for user:', userId, 'and challenge ID:', challengeId);
            
            // Find a user goal that matches the user ID and goal ID, and is not finished
            const userGoal = await this.usersGoalsModel.findOne({
                user: userId,
                goal: challengeId,
                finnish: null
            }).populate('goal');
            
            console.log('Found user goal:', userGoal);
            return userGoal;
        } catch (error) {
            console.error('Error finding active goal by challenge:', error);
            throw error;
        }
    }

    async updateGoalProgress(userGoalId, distance, time) {
        try {
            const userGoal = await this.usersGoalsModel.findById(userGoalId).populate("goal");
            
            if (!userGoal) {
                throw new Error("User goal not found");
            }
            
            // Update distance and time
            const updatedDistance = (userGoal.distance || 0) + distance;
            const updatedTime = (userGoal.time || 0) + time;
            
            const updateData = { 
                distance: updatedDistance,
                time: updatedTime 
            };
            
            // Check if goal is completed
            if (userGoal.goal.distance && updatedDistance >= userGoal.goal.distance) {
                updateData.finnish = new Date();
            } else if (userGoal.goal.time && updatedTime >= userGoal.goal.time) {
                updateData.finnish = new Date();
            }
            
            await this.usersGoalsModel.updateOne(
                { _id: userGoalId },
                { $set: updateData }
            );
            
            return {
                updatedDistance,
                updatedTime,
                completed: !!updateData.finnish
            };
        } catch (error) {
            console.error('Error updating goal progress:', error);
            throw error;
        }
    }

    async createUserGoal(userGoalData) {
        try {
            const newUserGoal = new this.usersGoalsModel(userGoalData);
            await newUserGoal.save();
            return newUserGoal;
        } catch (error) {
            console.error('Error creating user goal:', error);
            throw error;
        }
    }

};
