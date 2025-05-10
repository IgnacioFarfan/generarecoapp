import appLoader from "./express.js";
import mongoLoader from "./mongoose.js"

export default async (app) => {
    await appLoader(app);
    console.log("Express iniciado");
    const mongo = await mongoLoader(process.env.DB_URL);
    console.log("Mongo conectado");
}
