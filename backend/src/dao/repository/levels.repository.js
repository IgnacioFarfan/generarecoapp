export default class LevelsRepository {
    constructor(levelsModel) {
        this.levelsModel = levelsModel;
    }

    saveLevel = async (levelsData) => {
        try {
            const newLevel = new this.levelsModel(levelsData);
            await newLevel.save();
            return newLevel;
        } catch (error) {
            console.error('Error saving level:', error);
            throw error;
        }
    };

    getLevelById = async (lid) => {
        const level = await this.levelsModel.findById(lid)
        return level;
    };

    getLevels = async () => {
        return await this.levelsModel.find({});
    };

    updateLevel = async (lid, name, icon) => {
        try {
            await this.levelsModel.findByIdAndUpdate(lid, { name: name, icon: icon });
            const level = await this.levelsModel.findById(lid)
            return level;
        } catch (error) {
            throw error;
        }
    };

    deleteLevel = async (lid) => {
        return await this.levelsModel.findByIdAndDelete(lid);
    };

}
