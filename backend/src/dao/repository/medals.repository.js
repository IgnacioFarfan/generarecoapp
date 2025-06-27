export default class MedalsRepository {
    constructor(medalsModel) {
        this.medalsModel = medalsModel;
    }

    saveMedal = async (medalData) => {
        try {
            const newMedal = new this.medalsModel(medalData);
            await newMedal.save();
            return newMedal;
        } catch (error) {
            console.error('Error saving medal:', error);
            throw error;
        }
    };

    getMedalById = async (mid) => {
        const medal = await this.medalsModel.findById(mid)
        return medal;
    };

    getMedals = async () => {
        return await this.medalsModel.find({});
    };

    updateMedal = async (mid, name, icon) => {
        try {
            await this.medalsModel.findByIdAndUpdate(mid, { name: name, icon: icon });
            const medal = await this.medalsModel.findById(mid)
            return medal;
        } catch (error) {
            throw error;
        }
    };

    deleteMedal = async (mid) => {
        return await this.medalsModel.findByIdAndDelete(mid);
    };

}
