import mongoose from "mongoose";

const userGoalsCollection = "usergoals";

const userGoalsSchema = new mongoose.Schema({
    start: { type: Date, default: Date.now },
    finnish: { type: Date, default: null },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    goal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "goals"
    },
});

const userGoalsModel = mongoose.model(userGoalsCollection, userGoalsSchema);
export default userGoalsModel;