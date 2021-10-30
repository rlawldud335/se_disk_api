import nodemailer from 'nodemailer';
import config from "./index";

export default nodemailer.createTransport({
    service: config.mailService,
    host: config.mailHost,
    port: config.mailPort,
    auth: {
        user: config.mailUser,
        pass: config.mailPw
    },
    tls: {
        rejectUnauthorized: false
    }
});