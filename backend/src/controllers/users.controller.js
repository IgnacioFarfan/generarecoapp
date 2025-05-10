import { generateToken, createHash, isValidPass } from "../tools/utils.js";
//import mailer from "../tools/mailer.js";
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

    userSigninOrLogin = async (req, res, next) => {
        try {
            const user = req.user;
            const userName = user.userName;
            const firstName = user.firstName;
            const lastName = user.lastName;
            const email = user.email;
            const lastLogin = user.lastLogin;
            const range = user.range;
            const height = user.height;
            const weight = user.weight;
            const age = user.age;
            const avatar = user.avatar;
            const id = user._id;
            const country = user.country;
            const status = user.status;
            let token = generateToken({ userName, id, email });
            res.status(200).send({ id, userName, status, firstName, lastName, email, lastLogin, range, height, weight, age, avatar, country, token })
        } catch (error) {
            next(error)
        }
    }

    updateUserPassword = async (req, res, next) => {
        const { uid, password } = req.body;
        try {
            const user = await this.usersRepo.getUserById(uid);
            if (!user) {
                CustomError.createError({
                    name: "Error restaurando contraseña",
                    message: `Usuario con ID ${uid} no encontrado.`,
                    code: TErrors.NOT_FOUND,
                });
            }
            if (password.length < 8) {
                CustomError.createError({
                    name: "Error restaurando contraseña",
                    message: "Contraseña inválida. Debe tener 8 carácteres mínimo.",
                    code: TErrors.INVALID_TYPES,
                });
            }
            if (isValidPass(password, user.password)) {
                CustomError.createError({
                    name: "Error restaurando contraseña",
                    message: "La contraseña debe ser diferente a la anterior.",
                    code: TErrors.INVALID_TYPES,
                });
            }
            await this.usersRepo.updateUserField(uid, "password", createHash(password));
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
                                  'range', 'height', 'weight', 'age', 'country', 
                                  'gender', 'experience'];
            
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
            
            const userUpdated = await this.usersRepo.updateUser(user._id, updateFields);
            res.status(200).send(userUpdated)
        } catch (error) {
            next(error)
        }
    }

    passRestoration = async (req, res, next) => {
        const { email } = req.params;
        try {
            const user = await this.usersRepo.getUser(email);
            if (user === null) {
                CustomError.createError({
                    message: `Usuario con email ${email} no encontrado`,
                    code: TErrors.INVALID_TYPES,
                });
            }
            await mailer({ mail: email, name: user.firstName },
                `Haz click en el enlace para restaurar tu contraseña: <a href="https://hector039.github.io/client55650/forgot/${email}">Restaurar</a>`)
            res.status(200).send(`Se envió la solicitud de restauración a ${email}`);
        } catch (error) {
            next(error)
        }
    }

    userForgotPass = async (req, res, next) => {
        const { email, password } = req.body;
        try {
            const user = await this.usersRepo.getUser(email);
            if (user === null) {
                CustomError.createError({
                    message: "Usuario no encontrado.",
                    code: TErrors.NOT_FOUND,
                });
            }
            if (password.length > 8 || password.length < 4) {
                CustomError.createError({
                    message: "Recuerda, entre 4 y 8 caracteres",
                    code: TErrors.INVALID_TYPES,
                });
            }
            if (isValidPass(password, user.password)) {
                CustomError.createError({
                    message: "La contraseña debe ser diferente a la anterior.",
                    code: TErrors.INVALID_TYPES,
                });
            }
            await this.usersRepo.updateUserField(user._id, "password", createHash(password));
            await mailer({ mail: email, name: user.firstName }, "Se cambió tu contraseña.")
            res.status(200).send("Se cambió la contraseña correctamente.");
        } catch (error) {
            next(error)
        }
    }

    userLogout = async (req, res) => {
        return res.status(200).send("Usuario deslogueado!");
    }

    facebook = async (req, res) => { };

    facebookStrategy = async (req, res) => {
        try {
            const user = req.user;
            const userName = user.userName;
            const firstName = user.firstName;
            const lastName = user.lastName;
            const email = user.email;
            const lastLogin = user.lastLogin;
            const range = user.range;
            const height = user.height;
            const weight = user.weight;
            const age = user.age;
            const avatar = user.avatar;
            const id = user._id;
            const country = user.country;
            const status = user.status;
            let token = generateToken({ userName, id, email });
            res.status(200).send({ id, userName, status, firstName, lastName, email, lastLogin, range, height, weight, age, avatar, country, token })
        } catch (error) {
            next(error)
        }
    }

    google = async (req, res) => { };

    googleStrategy = async (req, res) => {//get
        try {
            const user = req.user;
            const userName = user.userName;
            const firstName = user.firstName;
            const lastName = user.lastName;
            const email = user.email;
            const lastLogin = user.lastLogin;
            const range = user.range;
            const height = user.height;
            const weight = user.weight;
            const age = user.age;
            const avatar = user.avatar;
            const id = user._id;
            const country = user.country;
            const status = user.status;
            let token = generateToken({ userName, id, email });
            res.status(200).send({ id, userName, status, firstName, lastName, email, lastLogin, range, height, weight, age, avatar, country, token })
        } catch (error) {
            next(error)
        }
    }

}

