import jwt from 'jsonwebtoken';
import config from '../config';
import argon2 from 'argon2';
import models, { sequelize } from "../database/models";
import stmpTransport from "../config/email";

export default class AuthService {

    constructor() {
        this.table = {};
    }

    async LogIn(loginId, password) {
        try {
            const { dataValues: user } = await models.users.findOne({ where: { user_login_id: loginId } });
            if (!user) {
                throw new Error('User not registered');
            }
            const validPassword = await argon2.verify(user.user_password, password);
            if (validPassword) {
                const token = this.generateToken(user);
                console.log(user);
                delete user.user_password;
                delete user.user_salt;
                return { user, token };
            } else {
                throw new Error('Invalid Password');
            }
        } catch (e) {
            throw e;
        }
    }

    async DoubleCheckId(loginId) {
        try {
            const { dataValues: { userCount } } = await models.users.findOne({
                where: {
                    user_login_id: loginId
                },
                attributes: [[sequelize.fn('COUNT', 'user_id'), 'userCount']]
            });
            if (userCount == 0) {
                return false;
            } else {
                return true;
            }
        } catch (e) {
            throw e;
        }
    }

    async SendEmail(email) {
        try {
            const randomStr = Math.random().toString(36).substring(2, 8);
            const mailOptions = {
                from: process.env.MAIL_EMAIL,
                to: email,
                subject: "[SE_DISK] 인증 관련 이메일 입니다.",
                text: "오른쪽 문자 6자리를 입력해주세요 : " + randomStr,
            };
            const { messageId } = await stmpTransport.sendMail(mailOptions);
            const emailId = 'auth' + messageId.substring(1, 8);

            this.table[emailId] = randomStr;
            return emailId;
        } catch (e) {
            throw e;
        }
    }

    async AuthEmail(emailId, authStr) {
        try {
            if (this.table[emailId] == authStr) {
                return true;
            } else {
                return false;
            }
        } catch (e) {
            throw e;
        }
    }


    generateToken(user) {
        const today = new Date();
        const exp = new Date(today);
        exp.setDate(today.getDate() + 60);

        return jwt.sign(
            {
                _id: user.user_id,
                name: user.user_name,
                exp: exp.getTime() / 1000,
            },
            config.jwtSecret
        );
    }
}