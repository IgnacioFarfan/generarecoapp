import mongoose from "mongoose";

const medalsCollection = "medals";

const medalsSchema = new mongoose.Schema({
    name: { type: String, default: "Semilla", unique: true },
    icon: { type: String, default: "http://192.168.100.48:5000/medaldefault.png" },
    position: Number
});

medalsSchema.pre('save', async function(next) { //esto se ejecuta antes de crear un documento nuevo
    if (this.isNew) { // entra acá solo si el documento es nuevo
        try {
            const lastMedal = await this.constructor.findOne({}, {}, { sort: { 'position': -1 } });//traigo el documento con position más alto
            if (lastMedal && typeof lastMedal.position === 'number') {
                this.position = lastMedal.position + 1;
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


const medalsModel = mongoose.model(medalsCollection, medalsSchema);
export default medalsModel;
