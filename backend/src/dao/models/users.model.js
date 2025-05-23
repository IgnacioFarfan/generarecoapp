import mongoose from "mongoose";

const userCollection = "users";

const userSchema = new mongoose.Schema({
    userName: { type: String, require: true, max: [8, '8 caracteres máximo'], min: [4, '4 caracteres mínimo'], unique: true },
    firstName: String,
    lastName: String,
    email: { type: String, require: true, unique: true },
    password: { type: String, require: true, max: [8, '8 caracteres máximo'], min: [4, '4 caracteres mínimo'] },
    idGoogle: { type: String, default: null },
    idFacebook: { type: String, default: null },
    lastLogin: { type: Date, default: Date.now },
    registerDate: { type: Date, default: Date.now },
    status: { type: Boolean, default: true },
    range: { type: String, enum: ['Principiante', 'Intermedio', 'Avanzado'], default: "Principiante" },
    height: Number,
    weight: Number,
    age: Number,
    gender: { type: String, enum: ['Masculino', 'Femenino', 'Otro'], default: null },
    avatar: { type: String, default: "https://localhost:8080/public/data/userguest3.png" },
    country: String,
    totalKilometers: { type: Number, default: 0 }
});

const usersModel = mongoose.model(userCollection, userSchema);
export default usersModel;
