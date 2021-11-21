import models, { sequelize } from "../database/models";

export default class RecruitmentService {

    async DeleteRecruitment(recruitmentId){
        try{
            //applications에 있는 recruitment_id가 recruitmentId인거 삭제하기
            await models.applications.destroy({
                where: {
                    recruitment_id: recruitmentId
                }
            })
            //recruitemnts에서 삭제하기
            await models.recruitments.destroy({
                where: {
                    recruitment_id: recruitmentId
                }
            })
        }catch(e){
            throw e;
        }
    }

    async RefuseApplication(recruitmentId, userId) {
        try {
            await models.applications.update({
                application_stat: '거절'
            }, {
                where: { recruitment_id: recruitmentId, user_id: userId }
            })
        } catch (e) {
            throw e;
        }
    }

    async AcceptApplication(recruitmentId, userId) {
        try {
            const updateRow = await models.applications.update({
                application_stat: '수락'
            }, {
                where: { recruitment_id: recruitmentId, user_id: userId }
            })
            if (updateRow == 1) {
                await models.recruitments.update({
                    recruitment_recruited_cnt: models.sequelize.literal('recruitment_recruited_cnt + 1'),
                }, {
                    where: { recruitment_id: recruitmentId }
                })
            }
        } catch (e) {
            throw e;
        }
    }

    async DeleteApplication(recruitmentId, userId) {
        try {
            const application = await models.applications.findOne({
                where : {
                    recruitment_id: recruitmentId,
                    user_id: userId
                },
                raw: true
            })
            const deleteRow = await models.applications.destroy({
                where: {
                    recruitment_id: recruitmentId,
                    user_id: userId
                }
            })
            if (deleteRow == 1) {
                if(application.application_stat=='수락'){
                    await models.recruitments.update({
                        recruitment_recruited_cnt: models.sequelize.literal('recruitment_recruited_cnt - 1'),
                    }, {
                        where: { recruitment_id: recruitmentId }
                    })
                }
                await models.recruitments.update({
                    recruitment_applied_cnt: models.sequelize.literal('recruitment_applied_cnt - 1'),
                }, {
                    where: { recruitment_id: recruitmentId }
                })
            }
        } catch (e) {
            throw e;
        }
    }

    async CreateApplication(recruitmentId, userId) {
        try {
            const application = await models.applications.findOrCreate({
                where : {
                    recruitment_id: recruitmentId,
                    user_id: userId
                },
                defaults:{
                    recruitment_id: recruitmentId,
                    user_id: userId
                },
                raw:true
            })
            if(application[1]){
                await models.recruitments.update({
                    recruitment_applied_cnt: models.sequelize.literal('recruitment_applied_cnt + 1'),
                }, {
                    where: { recruitment_id: recruitmentId }
                })
            }
            return application[0];
        } catch (e) {
            throw e;
        }
    }

    async EndRecruitment(recruitmentId) {
        try {
            const raw = await models.recruitments.update({
                recruitment_stat: '마감'
            }, {
                where: { recruitment_id: recruitmentId },
                raw: true
            })
            if (raw == 0) { throw Error('이미 마감됨'); }
            else if (raw != 1) { throw Error('잘못된 마감'); }
        } catch (e) {
            throw e;
        }
    }

    async GetRecruitment(recruitmentId) {
        try {
            const query = `
            SELECT recruit.*, users.user_name, users.user_email, users.user_type, users.user_image,
            users.user_introduction, users.user_github, users.user_blog, users.user_position, users.user_school_num
            FROM se_disk.recruitments recruit
            JOIN se_disk.users users
            ON recruit.user_id = users.user_id
            WHERE recruit.recruitment_id=:recruitmentId;
            `;
            const [recruitment] = await models.sequelize.query(query, {
                replacements: { recruitmentId },
                type: models.sequelize.QueryTypes.SELECT,
                raw: true
            });
            return recruitment;
        } catch (e) {
            throw e;
        }
    }


    async GetApplicationlist(recruitmentId){
        try{
            const query = `
                SELECT app.application_stat, users.user_name, users.user_email, users.user_type, users.user_image,
                users.user_introduction, users.user_github, users.user_blog, users.user_position, users.user_school_num
                FROM se_disk.applications app
                JOIN se_disk.users users
                ON app.user_id = users.user_id
                where app.recruitment_id=:recruitmentId;
                `;
            const applicants = await models.sequelize.query(query, {
                replacements: { recruitmentId },
                type: models.sequelize.QueryTypes.SELECT,
                raw: true
            });
            return applicants;
        }catch(e){
            throw e;
        }
    }

    async SearchRecruitment(pageNum, pageCount, keyword, subject) {
        try {
            let offset = 0;
            if (pageNum > 1) {
                offset = pageCount * (pageNum - 1);
            }
            let keywordQuery = '';
            if (keyword) {
                keywordQuery = `AND recruit.recruitment_title LIKE '%${keyword}%'`;
            }
            let subjectQuery = '';
            if (subject) {
                subjectQuery = `AND recruit.recruitment_subject = '${subject}'`;
            }
            const query = `
            SELECT recruit.*, users.user_name, users.user_email, users.user_type, users.user_image,
            users.user_introduction, users.user_github, users.user_blog, users.user_position, users.user_school_num 
            FROM se_disk.recruitments recruit
            JOIN se_disk.users users
                ON recruit.user_id = users.user_id
            WHERE 1=1
            ${keywordQuery}
            ${subjectQuery}
            ORDER BY (CASE WHEN recruitment_stat='모집중'THEN 1 ELSE 2 END), recruitment_stat ASC ,
            recruit.recruitment_created_datetime DESC
            LIMIT :pageCount OFFSET :offset;
            `;
            const recruitments = await models.sequelize.query(query, {
                replacements: { pageCount, offset },
                type: models.sequelize.QueryTypes.SELECT,
                raw: true
            });
            const query2 = `
            SELECT COUNT(*) as count
            FROM se_disk.recruitments recruit
            JOIN se_disk.users users
                ON recruit.user_id = users.user_id
            WHERE 1=1
            ${keywordQuery}
            ${subjectQuery}
            `;
            const [{ count }] = await models.sequelize.query(query2, {
                type: models.sequelize.QueryTypes.SELECT,
                raw: true
            });
            return { recruitments, count }
        } catch (e) {
            throw e;
        }
    }

    async GetAllRecruitment(pageNum, pageCount) {
        try {
            let offset = 0;
            if (pageNum > 1) {
                offset = pageCount * (pageNum - 1);
            }
            const query = `SELECT recruit.*, users.user_name, users.user_email, users.user_type, users.user_image,
            users.user_introduction, users.user_github, users.user_blog, users.user_position, users.user_school_num 
           FROM se_disk.recruitments recruit
           JOIN se_disk.users users
               ON recruit.user_id = users.user_id
           ORDER BY (CASE WHEN recruitment_stat='모집중'THEN 1 ELSE 2 END), recruitment_stat ASC ,
           recruit.recruitment_created_datetime DESC
           LIMIT :pageCount OFFSET :offset;
            `;
            const recruitments = await models.sequelize.query(query, {
                replacements: { pageCount, offset },
                type: models.sequelize.QueryTypes.SELECT,
                raw: true
            });
            const count = await models.recruitments.findAll({
                attributes: [[sequelize.fn('COUNT', sequelize.col('recruitment_id')), 'count']],
                raw: true
            })
            return { recruitments, count: count[0].count };
        } catch (e) {
            throw e;
        }
    }

    async CreateRecruitment(userId, RecruitInput) {
        try {
            const { dataValues: recruitment } = await models.recruitments.create({
                ...RecruitInput,
                user_id: userId
            })
            delete recruitment.recruitment_created_datetime;
            return recruitment;
        } catch (e) {
            throw e;
        }
    }

    async UpdateRecruitment(recruitmentId, RecruitInput) {
        try {
            await models.recruitments.update({
                ...RecruitInput
            }, {
                where: { recruitment_id: recruitmentId },
                raw: true
            })
            const recruitment = await models.recruitments.findOne({
                where: { recruitment_id: recruitmentId },
                raw: true
            })
            return recruitment;
        } catch (e) {
            throw e;
        }
    }
}