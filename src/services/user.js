import jwt from 'jsonwebtoken';
import config from '../config';
import argon2 from 'argon2';
import { randomBytes } from 'crypto';
import models from "../database/models";

export default class UserService {

    async UpdateUser(userId, userInput) {
        try {
            await models.users.update({
                ...userInput
            }, {
                where: {
                    user_id: userId
                }
            });
            const { dataValues: user } = await models.users.findOne({ where: { user_id: userId } });
            delete user.user_password;
            delete user.user_salt;
            return user;
        } catch (e) {
            throw e;
        }
    }

    async CreateUser(userInput) {
        try {
            const salt = randomBytes(32);
            const hashedPassword = await argon2.hash(userInput.user_password, { salt });

            const { dataValues: user } = await models.users.create({
                ...userInput,
                user_salt: salt.toString('hex'),
                user_password: hashedPassword,
                user_notification_stat: 0,
            });

            const token = this.generateToken(user);

            if (!user) {
                throw new Error('User cannot be created');
            }

            delete user.user_password;
            delete user.user_salt;
            return { user, token };
        } catch (e) {
            throw e;
        }
    }

    async GetUser(userId) {
        try {
            const { dataValues: user } = await models.users.findOne({ where: { user_id: userId } });
            delete user.user_password;
            delete user.user_salt;
            return user;
        } catch (e) {
            throw e;
        }
    }

    async CreateFollow(userId, targetId) {
        try {
            const follow = await models.follows.findOrCreate({
                where: { user_id: userId, target_id: targetId },
                defaults: {
                    user_id: userId,
                    target_id: targetId
                }
            })
            return follow;
        } catch (e) {
            throw e;
        }
    }

    async GetFollower(userId) {
        try {
            const query = `SELECT DISTINCT us.user_id, us.user_name, us.user_name, us.user_image, us.user_type 
            FROM se_disk.users as us, se_disk.follows as fw 
            WHERE fw.target_id= :userId and fw.user_id = us.user_id`;
            const followers = await models.sequelize.query(query, {
                replacements: { userId },
                type: models.sequelize.QueryTypes.SELECT,
                raw: true
            });
            return followers;
        } catch (e) {
            throw e;
        }
    }
    async GetFollowing(userId) {
        try {
            const query = `SELECT DISTINCT us.user_id, us.user_name, us.user_name, us.user_image, us.user_type 
            FROM se_disk.users as us, se_disk.follows as fw 
            WHERE fw.user_id= :userId and fw.target_id = us.user_id`;
            const followings = await models.sequelize.query(query, {
                replacements: { userId },
                type: models.sequelize.QueryTypes.SELECT,
                raw: true
            });
            return followings;
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