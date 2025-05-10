import mongoose from "mongoose";

const goalsCollection = "goals";

const goalsSchema = new mongoose.Schema({
    name: String,
    identifier: String,
    distance: { type: Number, required: true },
    speedAvg: Number,
    time: Number,
    is_groupal: {type: Boolean, default: false }
});

const goalsModel = mongoose.model(goalsCollection, goalsSchema);
export default goalsModel;
