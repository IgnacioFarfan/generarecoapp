import mongoose from "mongoose";

const goalsCollection = "goals";

const goalsSchema = new mongoose.Schema({
    title: { type: String, require: true },
    description: { type: String, require: true },
    note: String,
    time: Number,
    distance: Number,
    is_groupal: { type: Boolean, default: false },
    icon: String,
    position: Number
});

goalsSchema.pre('save', async function(next) { //esto se ejecuta antes de crear un documento nuevo
    if (this.isNew) { // entra acá solo si el documento es nuevo
        try {
            const lastGoal = await this.constructor.findOne({}, {}, { sort: { 'position': -1 } });//traigo el docuemnto con position más alto
            if (lastGoal && typeof lastGoal.position === 'number') {
                this.position = lastGoal.position + 1;
            } else {
                this.position = 1; // Si es el primer documento, empieza en 1
            }
            next();
        } catch (err) {
            next(err);
        }
    } else {
        next(); // Si no es un documento nuevo, continúa sin cambiar nada
    }
});

const goalsModel = mongoose.model(goalsCollection, goalsSchema);
export default goalsModel;
