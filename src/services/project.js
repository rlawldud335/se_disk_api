import models from "../database/models";

export default class ProjectService {

    async CreateLike(userId, projectId) {
        try {
            const like = await models.likes.findOrCreate({
                where: { user_id: userId, project_id: projectId },
                defaults: {
                    user_id: userId,
                    project_id: projectId
                }
            })
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
            if (deleteRow != 1) {
                throw new Error('deletedRow is not 1');
            }
        } catch (e) {
            throw e;
        }
    }

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

    async changeTags(projectId, TagsInput) {
        try {

        } catch (e) {
            throw e;
        }
    }

    async GetProject(projectId) {
        try {
            //project info
            const project = await models.projects.findOne({
                where: {
                    project_id: projectId
                },
                raw: true
            })
            //member names
            project.project_members = await models.possessions.findAll({
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
            //like

            //tags

            //posts list
            return project
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
            //프로젝트 소유자 변경
            project.project_members = await this.changeMembers(project.project_id, projectInput.project_members);
            //프로젝트 태그 변경
            project.project_tags = [];
            return project;
        } catch (e) {
            throw e;
        }
    }

}