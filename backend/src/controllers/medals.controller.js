import CustomError from "../tools/customErrors/customError.js";
import TErrors from "../tools/customErrors/enum.js";

export default class MedalsController {
    constructor(medalsRepo) {
        this.medalsRepo = medalsRepo;
    }

    saveMedal = async (req, res, next) => {
        const { name, icon } = req.body;
        try {
            if (!name) {
                CustomError.createError({
                    message: `Datos no recibidos o inválidos.`,
                    code: TErrors.INVALID_TYPES,
                });
            }
            const newMedal = await this.medalsRepo.saveMedal({ name, icon });
            res.status(200).send(newMedal);
        } catch (error) {
            next(error)
        }
    }

    getMedalById = async (req, res, next) => {
        const { mid } = req.params;
        try {
            const medal = await this.medalsRepo.getMedalById(mid);
            if (!medal) {
                CustomError.createError({
                    message: `Medalla ID: ${mid} no encontrada.`,
                    code: TErrors.NOT_FOUND,
                });
            }
            res.status(200).send(medal);
        } catch (error) {
            next(error)
        }
    }

    getMedals = async (req, res, next) => {
        try {
            const medals = await this.medalsRepo.getMedals();
            res.status(200).send(medals);
        } catch (error) {
            next(error)
        }
    }

    getMedalById = async (req, res, next) => {
        const { mid } = req.params;
        
        try {
            if (!mid) {
                CustomError.createError({
                    message: `ID de medalla no recibido.`,
                    code: TErrors.INVALID_TYPES,
                });
            }
            const medalById = await this.medalsRepo.getMedalById(mid);
            res.status(200).send(medalById);
        } catch (error) {
            next(error)
        }
    }

    updateMedal = async (req, res, next) => {
        const { mid, name, icon } = req.body;
        try {
            if (!mid || !name || !icon) {
                CustomError.createError({
                    message: `Datos no recibidos o inválidos.`,
                    code: TErrors.INVALID_TYPES,
                });
            }
            const medal = await this.medalsRepo.getMedalById(mid);
            if (!medal) {
                CustomError.createError({
                    message: `Medalla ID: ${mid} no encontrada.`,
                    code: TErrors.NOT_FOUND,
                });
            }
            const medalUpdated = await this.medalsRepo.updateMedal(mid, name, icon);
            res.status(200).send(medalUpdated);
        } catch (error) {
            next(error)
        }
    }

    deleteMedal = async (req, res, next) => {
        const { mid } = req.params;
        try {
            const medal = await this.medalsRepo.getMedalById(mid);
            if (!medal) {
                CustomError.createError({
                    message: `Medalla ID: ${mid} no encontrada.`,
                    code: TErrors.NOT_FOUND,
                });
            }
            await this.medalsRepo.deleteMedal(mid);
            res.status(200).send();
        } catch (error) {
            next(error)
        }
    }

}
