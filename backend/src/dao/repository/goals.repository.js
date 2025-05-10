export default class GoalsRepository {
    constructor(model) {
        this.goalsModel = model;
    }

    saveGoal = async (goalData) => {
        try {
            console.log('Creating new goal with data:', goalData);
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
            await this.goalsModel.findByIdAndUpdate(gid, { distance: distance, speedAvg: speed, time: time});
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
}
