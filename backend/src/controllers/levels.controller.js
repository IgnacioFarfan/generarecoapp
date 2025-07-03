import CustomError from "../tools/customErrors/customError.js";
import TErrors from "../tools/customErrors/enum.js";

export default class LevelsController {
    constructor(levelsRepo) {
        this.levelsRepo = levelsRepo;
    }

    saveLevel = async (req, res, next) => {
        const { name, note, icon } = req.body;
        try {
            if (!note || !name) {
                CustomError.createError({
                    message: `Datos no recibidos o inválidos.`,
                    code: TErrors.INVALID_TYPES,
                });
            }
            const newLevel = await this.levelsRepo.saveLevel({ name, note, icon });
            res.status(200).send(newLevel);
        } catch (error) {
            next(error)
        }
    }

    getLevelById = async (req, res, next) => {
        const { lid } = req.params;
        try {
            const level = await this.levelsRepo.getLevelById(lid);
            if (!level) {
                CustomError.createError({
                    message: `Nivel ID: ${lid} no encontrado.`,
                    code: TErrors.NOT_FOUND,
                });
            }
            res.status(200).send(level);
        } catch (error) {
            next(error)
        }
    }

    getLevels = async (req, res, next) => {
        try {
            const levels = await this.levelsRepo.getLevels();
            res.status(200).send(levels);
        } catch (error) {
            next(error)
        }
    }

    getLevelById = async (req, res, next) => {
        const { lid } = req.params;
        
        try {
            if (!lid) {
                CustomError.createError({
                    message: `ID de nivel no recibido.`,
                    code: TErrors.INVALID_TYPES,
                });
            }
            const levelsById = await this.levelsRepo.getLevelById(lid);
            res.status(200).send(levelsById);
        } catch (error) {
            next(error)
        }
    }

    updateLevel = async (req, res, next) => {
        const { lid, name, icon } = req.body;
        try {
            if (!lid || !name || !icon) {
                CustomError.createError({
                    message: `Datos no recibidos o inválidos.`,
                    code: TErrors.INVALID_TYPES,
                });
            }
            const level = await this.levelsRepo.getLevelById(lid);
            if (!level) {
                CustomError.createError({
                    message: `Nivel ID: ${lid} no encontrado.`,
                    code: TErrors.NOT_FOUND,
                });
            }
            const levelUpdated = await this.levelsRepo.updateLevel(lid, name, icon);
            res.status(200).send(levelUpdated);
        } catch (error) {
            next(error)
        }
    }

    deleteLevel = async (req, res, next) => {
        const { lid } = req.params;
        try {
            const level = await this.levelsRepo.getLevelById(lid);
            if (!level) {
                CustomError.createError({
                    message: `Nivel ID: ${lid} no encontrado.`,
                    code: TErrors.NOT_FOUND,
                });
            }
            await this.levelsRepo.deleteLevel(lid);
            res.status(200).send();
        } catch (error) {
            next(error)
        }
    }

}
