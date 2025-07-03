import mongoose from "mongoose";

const levelsCollection = "levels";

const levelsSchema = new mongoose.Schema({
    name: { type: String, default: "Semilla", unique: true },
    note: String,
    icon: { type: String, default: "http://192.168.100.48:5000/leveldefault.png" },
});

const levelsModel = mongoose.model(levelsCollection, levelsSchema);
export default levelsModel;
