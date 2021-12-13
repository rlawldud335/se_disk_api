import jwt from 'jsonwebtoken';
import config from '../config';
import argon2 from 'argon2';
import { randomBytes } from 'crypto';
import models from "../database/models";
const { Op } = require("sequelize");

export default class UserService {

    async DeleteUser(userId){
        try{
            //지가 리더인 프로젝트 삭제
            const projectIds = await models.projects.findAll({
                where : {project_leader:userId},
                attributes: ['project_id'],
                raw: true
            })
            projectIds.map(async (id)=>{
                const projectId = id.project_id;
                //comments에서 project_id가 projectId인것 모두 삭제
            await models.comments.destroy({
                where: {
                    project_id: projectId
                }
            })
            //likes에서 project_id가 projectId인것 모두 삭제
            await models.likes.destroy({
                where: {
                    project_id: projectId
                }
            })
            //possessions에서 project_id가 projectId인것 모두 삭제
            await models.possessions.destroy({
                where: {
                    project_id: projectId
                }
            })
            //projects_categorys에서 project_id가 projectId인것 모두 삭제하기
            await models.projects_categorys.destroy({
                where: {
                    project_id: projectId
                }
            })
            //projects_tags에서 project_id가 projectId인것 모두 삭제하기
            await models.projects_tags.destroy({
                where: {
                    project_id: projectId
                }
            })

            //일단 project_id가 projectId인 post_id 들을 가져오기
            const postIds = await models.posts.findAll({
                where : {project_id:projectId},
                attributes: ['post_id'],
                raw: true
            })
            const Ids = postIds.map((id)=>id.post_id);
            //posts_attachments에서 post_id가 위에서 찾은 post_id인것들을 모두 삭제하기
            await models.posts_attachments.destroy({
                where: {
                    post_id: Ids
                }
            })
            //posts에서 project_id가 projectId인것 모두 삭제하기
            await models.posts.destroy({
                where: {
                    project_id: projectId
                }
            })
            
            //projects에서 project_id가 projectId인것 모두 삭제하기
            await models.projects.destroy({
                where: {
                    project_id: projectId
                }
            })
            });
            //참여중인 프로젝트 나가기
            await models.possessions.destroy({
                where: {
                    user_id: userId
                }
            })

            //user가 작성한 팀원모집글(recruitment) 삭제
            const recruitmentIds = await models.recruitments.findAll({
                where : {user_id:userId},
                attributes: ['recruitment_id'],
                raw: true
            })
            const rIds = recruitmentIds.map((id)=>id.recruitment_id);
            await models.applications.destroy({
                where: {
                    recruitment_id: rIds
                }
            })
            await models.recruitments.destroy({
                where: {
                    user_id: userId
                }
            })

            //user가 신청한 신청서(application) 삭제
            const applicationIds = await models.applications.findAll({
                where : {user_id:userId},
                attributes: ['application_id'],
                raw: true
            })
            applicationIds.map(async (id)=>{
                const applicationId = id.application_id;
                const application = await models.applications.findOne({
                    where : {
                        application_id: applicationId
                    },
                    raw: true
                })
                const deleteRow = await models.applications.destroy({
                    where: {
                        application_id: applicationId
                    }
                })
                if (deleteRow == 1) {
                    if(application.application_stat=='수락'){
                        await models.recruitments.update({
                            recruitment_recruited_cnt: models.sequelize.literal('recruitment_recruited_cnt - 1'),
                        }, {
                            where: { recruitment_id: application.recruitment_id }
                        })
                    }
                    await models.recruitments.update({
                        recruitment_applied_cnt: models.sequelize.literal('recruitment_applied_cnt - 1'),
                    }, {
                        where: { recruitment_id: application.recruitment_id }
                    })
                }
            });

            //팔로우/팔로워 삭제
            await models.follows.destroy({
                where: {
                    user_id: userId
                }
            })
            await models.follows.destroy({
                where: {
                    target_id: userId
                }
            })
            //댓글삭제
            const commentIds = await models.comments.findAll({
                where : {user_id:userId, comment_depth:0 },
                attributes: ['comment_id'],
                raw: true
            })
            const cIds = commentIds.map((id)=>id.comment_id);
            await models.comments.destroy({
                where: {
                    comment_parent: cIds
                }
            })
            await models.comments.destroy({
                where: {
                    user_id: userId
                }
            })

            //좋아요 삭제
            const likeIds = await models.likes.findAll({
                where : {user_id:userId},
                attributes: ['like_id'],
                raw: true
            })
            likeIds.map(async (id)=>{
                const likeId = id.like_id;
                const deleteRow = await models.likes.destroy({
                    where: { like_id:likeId }
                })
                if (deleteRow == 1) {
                    await models.projects.update({
                        project_like: models.sequelize.literal('project_like - 1'),
                    }, {
                        where: { project_id: projectId }
                    })
                }
            });
            
            //사용자 삭제
            await models.users.destroy({
                where: {
                    user_id: userId
                }
            })

            return true;
        }catch(e){
            throw e;
        }
    }

    async GetMyRecruitments(userId, pageNum, pageCount) {
        try {
            let offset = 0;
            if (pageNum > 1) {
                offset = pageCount * (pageNum - 1);
            }
            const query = `
            SELECT * 
            FROM se_disk.recruitments recruit
            WHERE recruit.user_id = :userId
            ORDER BY (CASE WHEN recruitment_stat='모집중'THEN 1 ELSE 2 END), recruitment_stat ASC ,
            recruit.recruitment_created_datetime DESC
            LIMIT :pageCount OFFSET :offset;
            `;
            const recruitments = await models.sequelize.query(query, {
                replacements: { userId, pageCount, offset },
                type: models.sequelize.QueryTypes.SELECT,
                raw: true
            });
            const [{ count }] = await models.recruitments.findAll({
                attributes: [[models.sequelize.fn('COUNT', models.sequelize.col('recruitment_id')), 'count']],
                where: { user_id: userId },
                raw: true
            });

            return { recruitments, count };
        } catch (e) {
            throw e;
        }
    }

    async GetLoginId(loginId) {
        try {
            console.log(loginId)
            const users = await models.users.findAll({
                attributes: ['user_id', 'user_login_id', 'user_name', 'user_type']
                , where: {
                    user_login_id: {
                        [Op.like]: loginId + "%"
                    }
                },
                raw: true
            })
            return users;
        } catch (e) {
            throw e;
        }
    }

    async GetProfessors() {
        try {
            const professors = await models.users.findAll({
                attributes: ['user_id', 'user_name'],
                where: { user_type: 'PROFESSOR' },
                raw: true
            });
            return professors;
        } catch (e) {
            throw e;
        }
    }

    async GetUserProject(userId, pageNum, pageCount) {
        try {
            let offset = 0;
            if (pageNum > 1) {
                offset = pageCount * (pageNum - 1);
            }
            const query = `SELECT projects.project_id, projects.project_title, projects.project_image,  projects.project_subject,
            projects.project_subject_year, projects.project_professor, projects.project_leader, projects.project_hit, 
            projects.project_created_datetime, projects.project_like, 
            JSON_ARRAYAGG(JSON_OBJECT("user_id", users.user_id, "user_name", users.user_name)) AS project_members,
            (SELECT JSON_ARRAYAGG(categorys.category_id) FROM se_disk.projects_categorys categorys WHERE categorys.project_id = projects.project_id) AS project_categorys,
            (SELECT JSON_ARRAYAGG(tags.tag_id) FROM se_disk.projects_tags tags WHERE tags.project_id = projects.project_id) AS project_tags
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
            const projectCnt = await models.possessions.findAll({
                attributes: [[models.sequelize.fn('COUNT', models.sequelize.col('project_id')), 'count']],
                where: { user_id: userId },
                raw: true
            });
            return { projects, count: projectCnt[0].count };
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
            projects.project_created_datetime, projects.project_like, 
            JSON_ARRAYAGG(JSON_OBJECT("user_id", users.user_id, "user_name", users.user_name)) AS project_members,
            (SELECT JSON_ARRAYAGG(tags.tag_id) FROM se_disk.projects_tags tags WHERE tags.project_id = projects.project_id) AS project_tags,
            (SELECT JSON_ARRAYAGG(categorys.category_id) FROM se_disk.projects_categorys categorys WHERE categorys.project_id = projects.project_id) AS project_categorys
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
            const projectCnt = await models.likes.findAll({
                attributes: [[models.sequelize.fn('COUNT', models.sequelize.col('project_id')), 'count']],
                where: { user_id: userId },
                raw: true
            });
            return { projects, count: projectCnt[0].count };
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
            const followingCnt = await models.follows.findAll({
                attributes: [[models.sequelize.fn('COUNT', models.sequelize.col('follows_id')), 'count']],
                where: { user_id: userId },
                raw: true
            });
            return { isNewRecord: follow[1], count: followingCnt[0].count };
        } catch (e) {
            throw e;
        }
    }

    async DeleteFollow(userId, targetId) {
        try {
            const deleteRow = await models.follows.destroy({
                where: { user_id: userId, target_id: targetId }
            })
            const followingCnt = await models.follows.findAll({
                attributes: [[models.sequelize.fn('COUNT', models.sequelize.col('follows_id')), 'count']],
                where: { user_id: userId },
                raw: true
            });
            return { isDeleted: deleteRow == 1 ? true : false, count: followingCnt[0].count };
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
            const followerCnt = await models.follows.findAll({
                attributes: [[models.sequelize.fn('COUNT', models.sequelize.col('follows_id')), 'count']],
                where: { target_id: userId },
                raw: true
            });
            return { followers, count: followerCnt[0].count };
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
            const followingCnt = await models.follows.findAll({
                attributes: [[models.sequelize.fn('COUNT', models.sequelize.col('follows_id')), 'count']],
                where: { user_id: userId },
                raw: true
            });
            return { followings, count: followingCnt[0].count };
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