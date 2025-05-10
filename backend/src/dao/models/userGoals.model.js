import mongoose from "mongoose";

const userGoalsCollection = "usergoals";

const userGoalsSchema = new mongoose.Schema({
    distance: { type: Number, default: 0 },
    start: { type: Date, default: Date.now },
    finnish: Date,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    goal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "goals"
    }
});

const userGoalsModel = mongoose.model(userGoalsCollection, userGoalsSchema);
export default userGoalsModel;