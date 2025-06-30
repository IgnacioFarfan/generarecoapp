import nodemailer from "nodemailer";
import __dirname from "./utils.js";
import fs from 'fs';

function editWord(html, originalWord, newWord) {
    const regex = new RegExp(originalWord, 'g'); // 'g' para reemplazar todas las ocurrencias
    return html.replace(regex, newWord);
}

const transport = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAILER_USER,
        pass: process.env.MAILER_PASSWORD
    }
})

export async function welcomeWithActivationMailer(user) {
    let htmlTemplate = fs.readFileSync('src/tools/templates/welcome-activation-template.html', 'utf8');
    const htmlTemplateEdited = editWord(htmlTemplate, 'pathToValidation', `http://localhost:5000/api/users/activateuser/${user._id}`)
    try {
        await transport.verify();
        console.log("El servidor está listo para enviar mails");

        if (!user.userName || !user.email) return "Error o falta de datos de usuario. No se envió el email."

        await transport.sendMail({
            from: process.env.MAILER_USER,
            to: user.email,
            subject: `Bienvenido a ECO Huellas ${user.userName}!`,
            html: htmlTemplateEdited
        });

        return;
    } catch (error) {
        throw error;
    }
}

export async function welcomeMailer(user) {
    let htmlTemplate = fs.readFileSync('src/tools/templates/welcome-template.html', 'utf8');
    try {
        await transport.verify();
        console.log("El servidor está listo para enviar mails");

        if (!user.userName || !user.email) return "Error o falta de datos de usuario. No se envió el email."

        await transport.sendMail({
            from: process.env.MAILER_USER,
            to: user.email,
            subject: `Bienvenido a ECO Huellas ${user.userName}!`,
            html: htmlTemplate
        });

        return;
    } catch (error) {
        throw error;
    }
}

export async function passRestorationMailer(user, password) {
    let htmlTemplate = fs.readFileSync('src/tools/templates/passrestoration-template.html', 'utf8');
    const htmlTemplateEdited = editWord(htmlTemplate, 'pathToValidation', `http://localhost:5000/api/users/passrestoration/${user._id}/${password}`)
    try {
        await transport.verify();
        console.log("El servidor está listo para enviar mails");

        if (!password || !user.email) return "Error o falta de datos de usuario. No se envió el email."

        await transport.sendMail({
            from: process.env.MAILER_USER,
            to: user.email,
            subject: `Solicitud restauración de password ECO Huellas`,
            html: htmlTemplateEdited
        });

        return;
    } catch (error) {
        throw error;
    }
}

export async function deactivateUserMailer(user) {
    let htmlTemplate = fs.readFileSync('src/tools/templates/deactivate-user-template.html', 'utf8');
    //const htmlTemplateEdited = editWord(htmlTemplate, 'pathToValidation', `http://localhost:5000/users/passrestoration/${user._id}/${password}`)
    try {
        await transport.verify();
        console.log("El servidor está listo para enviar mails");

        if (!user.email) return "Error o falta de datos de usuario. No se envió el email."

        await transport.sendMail({
            from: process.env.MAILER_USER,
            to: user.email,
            subject: `Confirmación de baja de ECO Huellas`,
            html: htmlTemplate
        });

        return;
    } catch (error) {
        throw error;
    }
}

