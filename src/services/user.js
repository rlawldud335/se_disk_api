import jwt from 'jsonwebtoken';
import config from '../config';
import argon2 from 'argon2';
import { randomBytes } from 'crypto';
import models from "../database/models";

export default class UserService {

    async GetUserProject(userId, pageNum, pageCount) {
        try {
            let offset = 0;
            if (pageNum > 1) {
                offset = pageCount * (pageNum - 1);
            }

            const query = `SELECT projects.project_id, projects.project_title, projects.project_image,  projects.project_subject,
              projects.project_subject_year, projects.project_professor, projects.project_leader, projects.project_hit, 
              projects.project_created_datetime, projects.project_category, projects.project_like, 
              JSON_ARRAYAGG(JSON_OBJECT("user_id", users.user_id, "user_name", users.user_name)) AS project_members
            FROM se_disk.possessions poss
            INNER JOIN  se_disk.projects projects
                ON poss.project_id = projects.project_id
            LEFT OUTER JOIN se_disk.possessions poss2
                ON poss2.project_id = projects.project_id
            INNER JOIN se_disk.users users
                ON poss2.user_id = users.user_id
            WHERE poss.user_id = :userId
            GROUP BY projects.project_id
            LIMIT :pageCount OFFSET :offset;
            `;
            const projects = await models.sequelize.query(query, {
                replacements: { userId, pageCount, offset },
                type: models.sequelize.QueryTypes.SELECT,
                raw: true
            });
            const query2 = `select count(*) as count
            from se_disk.possessions poss
            where poss.user_id = :userId;
            `;
            const count = await models.sequelize.query(query2, {
                replacements: { userId },
                type: models.sequelize.QueryTypes.SELECT,
                raw: true
            });
            console.log(count);
            projects.count = count;
            return { projects, count: count[0].count };
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    async GetUserLikeProject(userId, pageNum, pageCount) {
        try {
            let offset = 0;
            if (pageNum > 1) {
                offset = pageCount * (pageNum - 1);
            }

            const query = `SELECT projects.project_id, projects.project_title, projects.project_image,  projects.project_subject,
            projects.project_subject_year, projects.project_professor, projects.project_leader, projects.project_hit, 
            projects.project_created_datetime, projects.project_category, projects.project_like, 
            JSON_ARRAYAGG(JSON_OBJECT("user_id", users.user_id, "user_name", users.user_name)) AS project_members
            FROM se_disk.likes likes
            LEFT OUTER JOIN se_disk.projects projects
                ON likes.project_id = projects.project_id
            LEFT OUTER JOIN se_disk.possessions poss
                ON projects.project_id = poss.project_id
            LEFT OUTER JOIN se_disk.users users
                ON poss.user_id = users.user_id
            WHERE likes.user_id = :userId
            GROUP BY projects.project_id
            LIMIT :pageCount OFFSET :offset;
            ;`;
            const projects = await models.sequelize.query(query, {
                replacements: { userId, pageCount, offset },
                type: models.sequelize.QueryTypes.SELECT,
                raw: true
            });
            const query2 = `select count(*) as count
            FROM se_disk.likes likes
            WHERE likes.user_id = :userId;
            `;
            const count = await models.sequelize.query(query2, {
                replacements: { userId },
                type: models.sequelize.QueryTypes.SELECT,
                raw: true
            });
            console.log(count);
            projects.count = count;
            return { projects, count: count[0].count };
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
            delete user.user_created_datetime;
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
            const query = `SELECT users.user_id, users.user_name, users.user_image, users.user_type
            FROM se_disk.follows follows
            INNER JOIN se_disk.users users
            ON follows.user_id = users.user_id
            WHERE follows.target_id = :userId;`;
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
            const query = `SELECT users.user_id, users.user_name, users.user_image, users.user_type
            FROM se_disk.follows follows
            INNER JOIN se_disk.users users
            ON follows.target_id = users.user_id
            WHERE follows.user_id = :userId;`;
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