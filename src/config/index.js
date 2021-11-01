import dotenv from 'dotenv';

const envFound = dotenv.config();
if (envFound.error) {
    throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

export default {
    port: parseInt(process.env.PORT, 10),

    jwtSecret: process.env.JWT_SECRET,
    jwtAlgorithm: process.env.JWT_ALGO,

    mailService: process.env.MAIL_SERVICE,
    mailHost: process.env.MAIL_HOST,
    mailPort: process.env.MAIL_PORT,
    mailUser: process.env.MAIL_USER,
    mailPw: process.env.MAIL_PW,

    api: {
        prefix: '/api',
    },
};