import { usersRepository } from "../dao/repository/index.js";
import passport from "passport";
import local from "passport-local";
import { createHash, isValidPass } from "../tools/utils.js";
import { welcomeMailer, welcomeWithActivationMailer } from "../tools/mailer.js";
import moment from 'moment';

const localStrategy = local.Strategy;

const initializePassport = () => {

    passport.use("google", new localStrategy(
        { passReqToCallback: true, usernameField: "username" },
        async (req, username, password, done) => {
            const { googleId, firstName, lastName, email } = req.body;
            try {
                const user = await usersRepository.getUser(googleId);
                if (!user) {
                    const userEmail = await usersRepository.getUser(email);
                    if (userEmail) return done(null, userEmail, { messages: "El Email asociado a ese Usuario ya existe." });

                    const newUser = await usersRepository.saveUser({
                        userName: firstName + Math.random().toString(36).substring(7),
                        firstName: firstName,
                        lastName: lastName,
                        email: email,
                        password: Math.random().toString(36).substring(7),
                        idgoogle: googleId,
                        status: true
                    });

                    await welcomeMailer(newUser);
                    return done(null, newUser);
                }

                await usersRepository.updateUserField(user._id, "lastLogin", moment());
                return done(null, user);
            } catch (error) {
                return done(error, null)
            }
        }
    ));

    passport.use("signin", new localStrategy(
        { passReqToCallback: true, usernameField: "username" },
        async (req, username, password, done) => {
            const { firstName, lastName, email } = req.body;
            try {
                const userByEmail = await usersRepository.getUser(email);
                if (userByEmail) return done(null, false, { messages: "El Email ya existe." });

                const userByUserName = await usersRepository.getUser(username);
                if (userByUserName) return done(null, false, { messages: "El nombre de usuario ya existe." });

                const newUser = await usersRepository.saveUser({
                    userName: username,
                    firstName,
                    lastName,
                    email,
                    password: createHash(password)
                });

                await welcomeWithActivationMailer(newUser);
                return done(null, newUser);
            } catch (error) {
                return done(error, null);
            }
        }
    ));

    passport.use("login", new localStrategy(
        { usernameField: "email" },
        async (usermail, password, done) => {
            try {
                const user = await usersRepository.getUser(usermail);

                if (!user) return done(null, false, { messages: "El Usuario no existe." });
                if (!isValidPass(password, user.password)) return done(null, false, { messages: "Usuario o contraseña incorrecto." });
                if (user.wasDeactivated) {
                    await usersRepository.updateUserStatus(user._id);// actualizo en true el estado del usuario que estaba en false
                    await usersRepository.updateUserField(user._id, "wasDeactivated", false); // actualizo a false si es que la cuenta estaba desacativada
                    await usersRepository.updateUserField(user._id, "lastLogin", moment());// actualizo la fecha del logueo
                    return done(null, user)
                }
                // si la cuenta no estaba desactivada (osea en false) y el estado era falso, sí impedir el logueo
                if (!user.status) return done(null, false, { messages: "Activa tu cuenta antes de loguearte." });

                await usersRepository.updateUserField(user._id, "lastLogin", moment());
                return done(null, user)
            } catch (error) {
                return done(error, null);
            }
        }
    ));


    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (user, done) => {
        try {
            const userDeserialized = await usersRepository.getUser(user.id);
            done(null, userDeserialized);
        } catch (error) {
            done(error, null);
        }
    });
};



export default initializePassport;
