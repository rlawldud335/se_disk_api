import jwt from 'jsonwebtoken';
import config from '../config';
import argon2 from 'argon2';
import models, { sequelize } from "../database/models";
import stmpTransport from "../config/email";
import { randomBytes } from 'crypto';

export default class AuthService {

    constructor() {
        this.table = {};
    }

    async ChangePassword(loginId, changePassword) {
        try {
            const salt = randomBytes(32);
            const hashedPassword = await argon2.hash(changePassword, { salt });

            const result = await models.users.update({
                user_salt: salt.toString('hex'),
                user_password: hashedPassword,
            }, {
                where: { user_login_id: loginId },
                raw: true
            });

            if (result != 1) {
                throw new Error('User cannot be changed');
            }
        } catch (e) {
            throw e;
        }
    }

    async GetUserId(LoginId) {
        try {
            let isExitUser = false;
            let userId = null;
            const user = await models.users.findOne({
                where: { user_login_id: LoginId },
                raw: true
            })
            if (user) {
                isExitUser = true;
                userId = user.user_id;
            }
            return { isExitUser, userId }
        } catch (e) {
            throw e;
        }
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
            //이메일 중복확인
            const { emailCount } = await models.users.findOne({
                where: {
                    user_email: email
                },
                attributes: [[sequelize.fn('COUNT', 'user_email'), 'emailCount']],
                raw: true
            })
            if (emailCount == 0) {
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
                return { emailId, doubleCheck: true }
            }
            return { doubleCheck: false }
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