import models from "../database/models";

export default class ProjectService {

    async isLikeProject(userId, projectId) {
        try {
            const result = await models.likes.findOne({
                where: { user_id: userId, project_id: projectId },
                raw: true
            })
            if (result) { return true; }
            return false;
        } catch (e) {
            throw e;
        }
    }

    async GetAllTags() {
        try {
            const query = `
            SELECT JSON_ARRAYAGG( tag ) as tags
            FROM(SELECT DISTINCT tag_id as tag
            FROM se_disk.projects_tags) as a;
            `;
            const tags = await models.sequelize.query(query, {
                type: models.sequelize.QueryTypes.SELECT,
                raw: true
            });
            return tags[0].tags;
        } catch (e) {
            throw e;
        }
    }

    async UpProjectHit(projectId) {
        try {
            await models.projects.update({
                project_hit: models.sequelize.literal('project_hit + 1'),
            }, {
                where: { project_id: projectId }
            })
            const count = await models.projects.findOne({
                attributes: ['project_hit'],
                where: { project_id: projectId },
                raw: true
            });
            return count.project_hit;
        } catch (e) {
            throw e;
        }
    }

    async GetProjectCount() {
        try {
            const projectCnt = await models.projects.findAll({
                attributes: [[models.sequelize.fn('COUNT', models.sequelize.col('project_id')), 'count']],
                raw: true
            });
            return projectCnt[0].count;
        } catch (e) {
            throw e;
        }
    }

    async GetAllProject(pageNum, pageCount) {
        try {
            let offset = 0;
            if (pageNum > 1) {
                offset = pageCount * (pageNum - 1);
            }

            const query = `SELECT projects.project_id, projects.project_title, projects.project_image,  projects.project_subject,
            projects.project_subject_year, projects.project_professor, projects.project_leader, projects.project_hit, 
            projects.project_created_datetime, projects.project_category, projects.project_like,
            JSON_ARRAYAGG(JSON_OBJECT("user_id", users.user_id, "user_name", users.user_name)) AS project_members,
            (SELECT JSON_ARRAYAGG(tags.tag_id) FROM se_disk.projects_tags tags WHERE tags.project_id = 144) AS project_tags
            FROM se_disk.projects projects
            LEFT OUTER JOIN se_disk.possessions poss
            ON projects.project_id = poss.project_id
            LEFT OUTER JOIN se_disk.users users
            ON poss.user_id = users.user_id
            GROUP BY projects.project_id
            ORDER BY projects.project_created_datetime DESC
            LIMIT :pageCount OFFSET :offset;
            `;
            const projects = await models.sequelize.query(query, {
                replacements: { pageCount, offset },
                type: models.sequelize.QueryTypes.SELECT,
                raw: true
            });

            const projectCnt = await models.projects.findAll({
                attributes: [[models.sequelize.fn('COUNT', models.sequelize.col('project_id')), 'count']],
                raw: true
            });
            return { projects, count: projectCnt[0].count };
        } catch (e) {
            throw e;
        }
    }

    async CreateLike(userId, projectId) {
        try {
            const like = await models.likes.findOrCreate({
                where: { user_id: userId, project_id: projectId },
                defaults: {
                    user_id: userId,
                    project_id: projectId
                },
                raw: true
            })
            if (like[1]) {
                await models.projects.update({
                    project_like: models.sequelize.literal('project_like + 1'),
                }, {
                    where: { project_id: projectId }
                })
            }
            const projectCnt = await models.likes.findAll({
                attributes: [[models.sequelize.fn('COUNT', models.sequelize.col('project_id')), 'count']],
                where: {
                    user_id: userId
                },
                raw: true
            });
            return { isNewRecord: like[1], count: projectCnt[0].count };
        } catch (e) {
            throw e;
        }
    }

    async DeleteLike(userId, projectId) {
        try {
            const deleteRow = await models.likes.destroy({
                where: { user_id: userId, project_id: projectId }
            })
            if (deleteRow == 1) {
                await models.projects.update({
                    project_like: models.sequelize.literal('project_like - 1'),
                }, {
                    where: { project_id: projectId }
                })
            }
            const projectCnt = await models.likes.findAll({
                attributes: [[models.sequelize.fn('COUNT', models.sequelize.col('project_id')), 'count']],
                where: {
                    user_id: userId
                },
                raw: true
            });
            return projectCnt[0].count;
        } catch (e) {
            throw e;
        }
    }

    async GetProject(projectId) {
        try {
            const query = `SELECT projects.project_id, projects.project_title, projects.project_image,  projects.project_subject,
            projects.project_subject_year, projects.project_professor, projects.project_leader, projects.project_hit, 
            projects.project_created_datetime, projects.project_category, projects.project_like, project_introduction
				, JSON_ARRAYAGG(JSON_OBJECT(
                "user_id", users.user_id, 
                "user_name", users.user_name, 
                "user_email", users.user_email,
                "user_type", users.user_type,
                "user_image", users.user_image,
                "user_introduction", user_introduction,
                "user_github",user_github,
                "user_blog", user_blog,
                "user_position",user_position
                )) AS project_members,
                (SELECT JSON_OBJECT("user_id",projects.project_professor, "user_name", users2.user_name)
                FROM se_disk.users users2 
                WHERE projects.project_professor= users2.user_id) AS project_leader,
                (SELECT JSON_ARRAYAGG(tags.tag_id) FROM se_disk.projects_tags tags WHERE tags.project_id = 144) AS project_tags
                FROM se_disk.projects projects 
                INNER JOIN se_disk.possessions poss
                    ON projects.project_id = poss.project_id
                LEFT OUTER JOIN se_disk.users users
                    ON poss.user_id = users.user_id
                WHERE projects.project_id = :projectId;
            `;
            const projects = await models.sequelize.query(query, {
                replacements: { projectId },
                type: models.sequelize.QueryTypes.SELECT,
                raw: true
            });
            return projects[0];
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    async UpdateProject(projectId, projectInput) {
        try {
            //프로젝트 변경
            await models.projects.update({
                ...projectInput
            }, {
                where: {
                    project_id: projectId
                },
                raw: true
            })
            const project = await models.projects.findOne({
                where: {
                    project_id: projectId
                },
                raw: true
            })
            //프로젝트 소유자 변경
            if (projectInput.project_members) {
                projectInput.project_members.push(projectInput.project_leader);
                project.project_members = await this.UpdateMembers(project.project_id, projectInput.project_members);
            }
            //프로젝트 태그 변경
            if (projectInput.project_tags) {
                project.project_tags = await this.UpdateTags(project.project_id, projectInput.project_tags);
            }

            return project;
        } catch (e) {
            throw e;
        }
    }

    async CreateProject(projectInput) {
        try {
            //프로젝트 생성하기
            const { dataValues: project } = await models.projects.create({
                ...projectInput,
            });
            //프로젝트 소유자 변경
            if (projectInput.project_members) {
                projectInput.project_members.push(projectInput.project_leader);
                project.project_members = await this.UpdateMembers(project.project_id, projectInput.project_members);
            }
            //프로젝트 태그 변경
            if (projectInput.project_tags) {
                project.project_tags = await this.UpdateTags(project.project_id, projectInput.project_tags);
            }

            delete project.project_created_datetime;
            return project;
        } catch (e) {
            throw e;
        }
    }

    async UpdateMembers(projectId, MemberInput) {
        try {
            //프로젝트의 기존멤버 모두 삭제
            await models.possessions.destroy({
                where: { project_id: projectId }
            });

            //멤버중복제거
            let uniqueArr = [];
            MemberInput.forEach((element) => {
                if (!uniqueArr.includes(element)) {
                    uniqueArr.push(element);
                }
            });
            //새로운 멤버 추가
            const insertRow = uniqueArr.map((m) => {
                return { project_id: projectId, user_id: m }
            });
            await models.possessions.bulkCreate(insertRow, { raw: true });
            //새로운멤버조회
            const newMembers = await models.possessions.findAll({
                attributes: ['user.user_name', 'user_id'],
                where: { project_id: projectId },
                include: {
                    model: models.users,
                    as: 'user',
                    attributes: []
                },
                raw: true
            });
            return newMembers
        } catch (e) {
            throw e;
        }
    }

    async UpdateTags(projectId, TagsInput) {
        try {
            //기존의 태그 모두 삭제
            await models.projects_tags.destroy({
                where: { project_id: projectId }
            });
            //새로운 태그 중복제거
            let uniqueArr = [];
            TagsInput.forEach((element) => {
                if (!uniqueArr.includes(element)) {
                    uniqueArr.push(element);
                }
            });
            //새로운태그 입력하기
            const insertRow = uniqueArr.map((m) => {
                return { project_id: projectId, tag_id: m }
            });
            const result = await models.projects_tags.bulkCreate(insertRow, { raw: true })
            const newTags = result.map((m) => {
                return m.dataValues.tag_id;
            })
            return newTags
        } catch (e) {
            throw e;
        }
    }

}