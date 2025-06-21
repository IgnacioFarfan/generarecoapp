export default class GoalsRepository {
    constructor(goalModel, userGoalModel, userModel) {
        this.goalsModel = goalModel;
        this.userGoalModel = userGoalModel;
        this.userModel = userModel;
    }

    saveGoal = async (goalData) => {
        try {
            const newGoal = new this.goalsModel(goalData);
            await newGoal.save();
            return newGoal;
        } catch (error) {
            console.error('Error saving goal:', error);
            throw error;
        }
    };

    getGoalById = async (gid) => {
        const goal = await this.goalsModel.findById(gid)
        return goal;
    };

    getGoals = async () => {
        return await this.goalsModel.find({});
    };

    updateGoal = async (gid, distance, speed, time) => {
        try {
            await this.goalsModel.findByIdAndUpdate(gid, { distance: distance, speedAvg: speed, time: time });
            const goal = await this.goalsModel.findById(gid)
            return goal;
        } catch (error) {
            throw error;
        }
    };

    deleteGoal = async (gid) => {
        return await this.goalsModel.findByIdAndDelete(gid);
    };

    findGoalByName = async (name) => {
        try {
            console.log('Searching for goal with name or identifier:', name);

            // Try to find a goal with a matching name or identifier
            const goal = await this.goalsModel.findOne({
                $or: [
                    { name: name },
                    { identifier: name }
                ]
            });

            console.log('Goal search result:', goal);
            return goal;
        } catch (error) {
            console.error('Error finding goal by name:', error);
            throw error;
        }
    };

    getGoalsByUserLevel = async (uid) => {
        try {
            const { range } = await this.userModel.findById(uid, 'range')
            const userGoals = await this.userGoalModel.find({ user: uid })
            let goals = await this.goalsModel.find({ level: range })

            userGoals.forEach(userGoal => {
                const index = goals.findIndex(goal => String(goal._id) === String(userGoal.goal));
                if (index !== -1) {// Si se encuentra el índice (no es -1)
                    goals.splice(index, 1);
                }
            });
            
            return goals;
        } catch (error) {
            console.error('Error finding goal:', error);
            throw error;
        }
    };

    
    checkAndUpgradeUserLevel = async (userId) => {//actualiza el userGoal finalizando el desafío solo agregando la fecha en el campo finnish que al principio es nulo
        try {
            let userGoalsCount = 0
            const { range } = await this.userModel.findById(userId, 'range')
            const goals = await this.goalsModel.countDocuments({ level: range })
            console.log(goals);
            
            const userGoals = await this.userGoalModel.find({user: userId, finnish:{ $ne: null} }).populate('goal')
            userGoals.forEach(userGoal => {
                if (userGoal.goal.level === range) {
                    userGoalsCount++
                }
            });
            if (goals === userGoalsCount) {
                const user = await this.userModel.findByIdAndUpdate(userId, { range: range === 'Principiante' ? 'Intermedio' : 'Avanzado' });
                return {newRange: user.range, oldRange: range};
            }
            return {newRange: range, oldRange: range};
        } catch (error) {
            console.error('Error update finnish field', error);
            throw error;
        }
    };


}
