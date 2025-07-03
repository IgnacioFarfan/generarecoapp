import express from "express";
import indexRoute from "../routes/index.route.js";
import passport from "passport";
import initializePassport from "../config/passport.config.js";
import __dirname from "../tools/utils.js";
import cors from "cors";
import session from "express-session";
import { staticImgPath } from "../public/data/staticImgPath.js";
import usersGoalsRouter from "../routes/usersGoals.route.js";
 
/* const corsOptions = {
    origin: "http://10.0.2.2:8081",
    credentials: true
}; */

export default async function appLoader(app) {
    app.disable('x-powered-by')
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static(__dirname));
    app.use(express.static(staticImgPath));
    app.use(session({
        secret: process.env.USERCOOKIESECRET,
        resave: false,
        saveUninitialized: true
    }));

    initializePassport();
    app.use(passport.initialize());
    app.use(passport.session());

    app.use("/", indexRoute);
    app.use("/api/usersgoals", usersGoalsRouter);
    
    return app;
}
