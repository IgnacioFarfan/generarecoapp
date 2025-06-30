import { generateToken, createHash, isValidPass } from "../tools/utils.js";
import { welcomeMailer, passRestorationMailer, deactivateUserMailer } from "../tools/mailer.js";
import CustomError from "../tools/customErrors/customError.js";
import TErrors from "../tools/customErrors/enum.js";


export default class UsersController {
    constructor(repo) {
        this.usersRepo = repo;
    }

    getAllUsers = async (req, res, next) => {
        try {
            const users = await this.usersRepo.getAllUsers();
            if (!users) {
                CustomError.createError({
                    message: "Error recibiendo los usuarios, intenta de nuevo.",
                    code: TErrors.DATABASE,
                });
            }

            res.status(200).send(users)
        } catch (error) {
            next(error)
        }
    }

    getUser = async (req, res, next) => {
        const { uid } = req.params;
        try {
            const user = await this.usersRepo.getUserById(uid);
            if (!user) {
                CustomError.createError({
                    message: `Usuario ID ${uid} no encontrado.`,
                    code: TErrors.DATABASE,
                });
            }
            res.status(200).send(user)
        } catch (error) {
            next(error)
        }
    }

    userLogin = async (req, res, next) => {
        try {
            const user = req.user;
            const userName = user.userName;
            const firstName = user.firstName ? user.firstName : null;
            const lastName = user.lastName ? user.lastName : null;
            const email = user.email;
            const lastLogin = user.lastLogin;
            const height = user.height ? user.height : null;
            const weight = user.weight ? user.weight : null;
            const age = user.age ? user.age : null;
            const avatar = user.avatar;
            const id = user._id;
            const status = user.status;
            const medal = user.medal;
            let token = generateToken({ userName, id, email });
            res.status(200).send({ id, userName, status, firstName, lastName, email, lastLogin, height, weight, age, avatar, token, medal })
        } catch (error) {
            next(error)
        }
    }

    userSignin = async (req, res, next) => {
        try {
            res.status(200).send({ message: 'Usuario registrado! Revisa tu email para activar tu cuenta.' })
        } catch (error) {
            next(error)
        }
    }

    userGoogleSigninOrLogin = async (req, res, next) => {
        try {
            const user = req.user;
            const userName = user.userName;
            const firstName = user.firstName ? user.firstName : null;
            const lastName = user.lastName ? user.lastName : null;
            const email = user.email;
            const lastLogin = user.lastLogin;
            const height = user.height ? user.height : null;
            const weight = user.weight ? user.weight : null;
            const age = user.age ? user.age : null;
            const avatar = user.avatar;
            const id = user._id;
            const status = user.status;
            const medal = user.medal;
            let token = generateToken({ userName, id, email });
            return res.status(200).send({ id, userName, status, firstName, lastName, email, lastLogin, height, weight, age, avatar, token, medal })
        } catch (error) {
            next(error)
        }
    }

    updateUserPassword = async (req, res, next) => {
        const { uid, newPassword } = req.body;
        try {
            const user = await this.usersRepo.getUserById(uid);
            if (!user) {
                CustomError.createError({
                    name: "Error restaurando contraseña",
                    message: `Usuario con ID ${uid} no encontrado.`,
                    code: TErrors.NOT_FOUND,
                });
            }

            if (isValidPass(newPassword, user.password)) {
                CustomError.createError({
                    name: "Error restaurando contraseña",
                    message: "La contraseña debe ser diferente a la anterior.",
                    code: TErrors.INVALID_TYPES,
                });
            }
            await this.usersRepo.updateUserPassword(uid, createHash(newPassword));
            res.status(200).send()
        } catch (error) {
            next(error)
        }
    }

    updateUserAvatar = async (req, res, next) => {
        const avatar = req.file;
        const user = req.user;
        try {
            if (!avatar) {
                CustomError.createError({
                    message: "No se recibió ningún archivo.",
                    code: TErrors.INVALID_TYPES,
                });
            }
            const avatarPath = `http://localhost:8080/${avatar.filename}`;
            await this.usersRepo.updateUserField(user.id, "avatar", avatarPath);
            res.status(200).send({ avatar: avatarPath })
        } catch (error) {
            next(error)
        }
    }

    updateUserStatus = async (req, res, next) => {
        const { uid } = req.params;
        try {
            const user = await this.usersRepo.getUserById(uid);
            if (!user) {
                CustomError.createError({
                    message: `Usuario ID ${uid} no encontrado`,
                    code: TErrors.NOT_FOUND
                });
            }
            await this.usersRepo.updateUserStatus(user._id);
            await welcomeMailer(user);
            res.status(200).send()
        } catch (error) {
            next(error)
        }
    }

    deactivateUser = async (req, res, next) => {
        const { uid } = req.params;
        try {
            const user = await this.usersRepo.getUserById(uid);
            if (!user) {
                CustomError.createError({
                    message: `Usuario ID ${uid} no encontrado`,
                    code: TErrors.NOT_FOUND
                });
            }
            await this.usersRepo.updateUserField(user._id, "wasDeactivated", true);
            await this.usersRepo.updateUserStatus(user._id);
            await deactivateUserMailer(user);
            res.status(200).send()
        } catch (error) {
            next(error)
        }
    }

    updateUserTotalKilometers = async (req, res, next) => {
        const { uid, distance } = req.params;
        try {
            if (!uid || !distance) {
                CustomError.createError({
                    message: `Faltan datos o están erróneos.`,
                    code: TErrors.INVALID_TYPES,
                });
            }
            const user = await this.usersRepo.getUserById(uid);
            if (!user) {
                CustomError.createError({
                    message: `Usuario ID ${uid} no encontrado`,
                    code: TErrors.NOT_FOUND
                });
            }
            await this.usersRepo.updateUserTotalKilometers(uid, distance);
            res.status(200).send()
        } catch (error) {
            next(error)
        }
    }

    updateUser = async (req, res, next) => {
        const { uid } = req.body;

        try {
            // Only require the user ID for updates
            if (!uid) {
                CustomError.createError({
                    message: `ID de usuario no recibido.`,
                    code: TErrors.INVALID_TYPES,
                });
            }

            const user = await this.usersRepo.getUserById(uid);
            if (!user) {
                CustomError.createError({
                    message: `Usuario ID ${uid} no encontrado`,
                    code: TErrors.NOT_FOUND
                });
            }

            // Create an update object with only the fields that were provided
            const updateFields = {};
            const allowedFields = ['userName', 'firstName', 'lastName', 'email',
                'height', 'weight', 'age', 'country',
                'gender'];

            allowedFields.forEach(field => {
                if (req.body[field] !== undefined) {
                    updateFields[field] = req.body[field];
                }
            });

            // Only update if there are fields to update
            if (Object.keys(updateFields).length === 0) {
                CustomError.createError({
                    message: `No se recibieron campos para actualizar.`,
                    code: TErrors.INVALID_TYPES,
                });
            }
            //console.log(uid, updateFields);

            const userUpdated = await this.usersRepo.updateUser(user._id, updateFields);
            res.status(200).send(userUpdated)
        } catch (error) {
            next(error)
        }
    }

    passRestoration = async (req, res, next) => {
        const { uid, hashedpass } = req.params;
        try {
            const user = await this.usersRepo.getUserById(uid);
            if (user === null) {
                CustomError.createError({
                    message: `Usuario con ID ${uid} no encontrado`,
                    code: TErrors.INVALID_TYPES,
                });
            }
            await this.usersRepo.updateUserField(user._id, "password", hashedpass);
            res.status(200).send();
        } catch (error) {
            next(error)
        }
    }

    userForgotPass = async (req, res, next) => {
        const { email, password } = req.body;
        try {
            const user = await this.usersRepo.getUser(email);
            if (!user) {
                CustomError.createError({
                    message: "Usuario no encontrado.",
                    code: TErrors.NOT_FOUND,
                });
            }
            if (isValidPass(password, user.password)) {
                CustomError.createError({
                    message: "La contraseña debe ser diferente a la anterior.",
                    code: TErrors.INVALID_TYPES,
                });
            }

            await passRestorationMailer(user, createHash(password))
            res.status(200).send("Se envió la solicitud correctamente.");
        } catch (error) {
            next(error)
        }
    }

    userLogout = async (req, res) => {
        return res.status(200).send("Usuario deslogueado!");
    }


    getUserTotalDistance = async (req, res, next) => {
        const { uid } = req.params;
        try {
            if (!uid) {
                CustomError.createError({
                    message: `Faltan datos o están erróneos.`,
                    code: TErrors.INVALID_TYPES,
                });
            }
            const user = await this.usersRepo.getUserById(uid);
            if (!user) {
                CustomError.createError({
                    message: `Usuario ID ${uid} no encontrado.`,
                    code: TErrors.NOT_FOUND,
                });
            }
            let userTotalKilometers = user.totalKilometers;
            // si los kilómetros acumulados en el campo totalKilometers del usuario es mayor a 100kmts,
            // se lo restamos para reiniciar el progreso y actualizamos el campo 'trees' en 1 que sería 
            // la cantidad de árboles que el usuario desbloqueó
            if (userTotalKilometers > 100) {
                userTotalKilometers = userTotalKilometers - 100
                await this.usersRepo.updateUserField(uid, 'totalKilometers', userTotalKilometers)
                await this.usersRepo.updateUserField(uid, 'trees', parseInt(user.trees) + 1)
            }
            res.status(200).send({ totalKilometers: userTotalKilometers })
        } catch (error) {
            next(error)
        }
    }

    getUserMedal = async (req, res, next) => {
        const { uid } = req.params;
        try {
            if (!uid) {
                CustomError.createError({
                    message: `Faltan datos o están erróneos.`,
                    code: TErrors.INVALID_TYPES,
                });
            }
            const user = await this.usersRepo.getUserById(uid);
            if (!user) {
                CustomError.createError({
                    message: `Usuario ID ${uid} no encontrado.`,
                    code: TErrors.NOT_FOUND,
                });
            }
            res.status(200).send({ userMedal: user.medal })
        } catch (error) {
            next(error)
        }
    }

    updateUserMedal = async (req, res, next) => {
        const { uid, medal } = req.params;
        try {
            if (!uid || !medal) {
                CustomError.createError({
                    message: `Faltan datos o están erróneos.`,
                    code: TErrors.INVALID_TYPES,
                });
            }
            const user = await this.usersRepo.getUserById(uid);
            if (!user) {
                CustomError.createError({
                    message: `Usuario ID ${uid} no encontrado.`,
                    code: TErrors.NOT_FOUND,
                });
            }
            await this.usersRepo.updateUserMedal(uid, medal);
            res.status(200).send({ userMedal: user.medal })
        } catch (error) {
            next(error)
        }
    }

}

