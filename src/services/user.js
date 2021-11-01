import jwt from 'jsonwebtoken';
import config from '../config';
import argon2 from 'argon2';
import { randomBytes } from 'crypto';
import models from "../database/models";

export default class UserService {

    async ChangePassword(userId, changePassword) {
        try {
            const salt = randomBytes(32);
            const hashedPassword = await argon2.hash(changePassword, { salt });

            const result = await models.users.update({
                user_salt: salt.toString('hex'),
                user_password: hashedPassword,
            }, {
                where: { user_id: userId },
                raw: true
            });

            if (result != 1) {
                throw new Error('User cannot be changed');
            }
        } catch (e) {
            throw e;
        }
    }

    async GetUserProject(userId) {
        try {
            const projects = await models.possessions.findAll({
                where: { user_id: userId },
                attributes: ['project_id', [models.sequelize.fn('count', models.sequelize.col('project.likes.like_id')), 'project_like_count']],
                group: ['project_id'],
                include: [
                    {
                        model: models.projects,
                        as: 'project',
                        attributes: ['project_title', 'project_image', 'project_hit', 'project_created_datetime'],
                        include: [
                            {
                                model: models.likes,
                                as: 'likes',
                                attributes: [],
                            }
                        ]
                    }
                ],
                raw: true,
            })
            //member이름 가져오기 - 수정필요...
            for (let i = 0; i < projects.length; i++) {
                const projectId = projects[i].project_id;
                const members = await models.possessions.findAll({
                    where: { project_id: projectId },
                    attributes: ['user_id'],
                    include: [{
                        model: models.users,
                        as: 'user',
                        attributes: ['user_name']
                    }],
                    raw: true
                })
                projects[i].project_members = members;
            }
            return projects;
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

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

    async DeleteFollow(userId, targetId) {
        try {
            const deleteRow = await models.follows.destroy({
                where: { user_id: userId, target_id: targetId }
            })
            if (deleteRow != 1) {
                throw new Error('deletedRow is not 1');
            }
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