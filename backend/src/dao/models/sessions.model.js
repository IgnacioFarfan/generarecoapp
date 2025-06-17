import mongoose from "mongoose";

const sessionCollection = "sessions";

const sessionSchema = new mongoose.Schema({
    distance: { type: Number, required: true },
    speedAvg: { type: Number, required: true },
    time: { type: Number, required: true },
    sessionDate: { type: Date, default: Date.now },
    calories: Number,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }
});

const sessionsModel = mongoose.model(sessionCollection, sessionSchema);
export default sessionsModel;