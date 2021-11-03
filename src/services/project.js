import models from "../database/models";

export default class ProjectService {

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

            const query = `SELECT projects.* , JSON_ARRAYAGG(JSON_OBJECT("user_id", users.user_id, "user_name", users.user_name)) AS project_members
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
            return projects;
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
            return like;
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
        } catch (e) {
            throw e;
        }
    }

    //수정필요함.
    async changeMembers(projectId, MemberInput) {
        try {
            const result = await models.possessions.findAll({
                where: { project_id: projectId },
                attributes: ['user_id'],
                raw: true,
            })
            const exitMembers = result.map(data => data.user_id);
            for (const eid of exitMembers) {
                if (MemberInput.indexOf(eid) == -1) {
                    await models.possessions.destroy({
                        where: { user_id: eid, project_id: projectId }
                    });
                }
            }
            for (const mid of MemberInput) {
                if (exitMembers.indexOf(mid) == -1) {
                    await models.possessions.create({
                        user_id: mid, project_id: projectId
                    });
                }
            }
            const resultMember = await models.possessions.findAll({
                where: { project_id: projectId },
                include: [
                    {
                        model: models.users,
                        as: 'user',
                        attributes: ['user_name']
                    }
                ],
                raw: true,
                attributes: ['user_id']
            })
            return resultMember;
        } catch (e) {
            throw e;
        }
    }

    //수정필요함.
    async changeTags(projectId, TagsInput) {
        try {

        } catch (e) {
            throw e;
        }
    }

    async GetProject(projectId) {
        try {
            const query = `SELECT projects.*, JSON_ARRAYAGG(JSON_OBJECT(
                "user_id", users.user_id, 
                "user_name", users.user_name, 
                "user_email", users.user_email,
                "user_type", users.user_type,
                "user_image", users.user_image,
                "user_introduction", user_introduction,
                "user_github",user_github,
                "user_blog", user_blog,
                "user_position",user_position
                )) AS project_members
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
            const changeRaws = await models.projects.update({
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
            project.project_members = await this.changeMembers(projectId, projectInput.project_members);
            //프로젝트 태그 변경
            project.project_tags = [];
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
            console.log(project);
            //프로젝트 소개글 등록
            //프로젝트 소유자 변경
            project.project_members = await this.changeMembers(project.project_id, projectInput.project_members);
            //프로젝트 태그 변경
            project.project_tags = [];
            delete project.project_created_datetime;
            return project;
        } catch (e) {
            throw e;
        }
    }

}