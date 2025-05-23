import { usersRepository } from "../dao/repository/index.js";
import passport from "passport";
import local from "passport-local";
import { createHash, isValidPass } from "../tools/utils.js";
import GoogleStrategy from "passport-google-oauth20";
//import mailer from "../tools/mailer.js";
import moment from 'moment';

const localStrategy = local.Strategy;

const initializePassport = () => {

    passport.use("google", new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            scope: ["profile email"]
        },
        async (accessToken, refreshToken, profile, cb) => {
            try {
                const user = await usersRepository.getUser(profile.id);
                if (!user) {
                    const userEmail = await usersRepository.getUser(profile._json.email);
                    if (userEmail) {
                        return cb(null, userEmail, { messages: "El Email asociado a ese Usuario ya existe." });
                    }
                    const newUser = await usersRepository.saveUser({
                        userName: profile.name.givenName + Math.random().toString(36).substring(7),
                        firstName: profile.name.givenName,
                        lastName: profile.name.familyName,
                        email: profile._json?.email,
                        password: Math.random().toString(36).substring(7),
                        idgoogle: profile.id,
                        gender: null,
                        experience: 'Beginner'
                    });

                    //await mailer({ mail: newUser.email, name: newUser.firstName }, "Bienvenido!")
                    return cb(null, newUser);
                }

                await usersRepository.updateUserField(user._id, "lastLogin", moment().format("DD MM YYYY, h:mm:ss a"));
                return cb(null, user);
            } catch (error) {
                return cb(error, null)
            }
        }
    ));

    /* passport.use("facebook", new FacebookStrategy(
        {
            clientID: process.env.GH_CLIENT_ID,
            clientSecret: process.env.GH_CLIENT_SECRETS,
            callbackURL: process.env.FB_CALLBACK_URL,
            scope: ["user: email"]
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const user = await usersRepository.getUser(profile.id);

                if (!user) {
                    const userEmail = await usersRepository.getUser(profile._json?.email);
                    if (userEmail) return done(null, userEmail, { messages: "El Email asociado a ese Usuario ya existe." });

                    const newUser = await usersRepository.saveUser({
                        userName: profile.name.givenName + Math.random().toString(36).substring(7),
                        firstName: profile.displayName.split(" ")[0],
                        lastName: profile.displayName.split(" ")[1],
                        email: profile._json?.email,
                        password: Math.random().toString(36).substring(7),
                        idFacebook: profile.id
                    });

                    await mailer({ mail: newUser.email, name: newUser.firstName }, "Bienvenido!")
                    return done(null, newUser);
                }
                
                await usersRepository.updateUserLastLogin(user._id, moment().format("DD MM YYYY, h:mm:ss a"));
                return done(null, user);
            } catch (error) {
                return done(error, null)
            }
        }
    )); */

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

                //await mailer({ mail: email, name: firstName }, `Bienvenido!`)
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
