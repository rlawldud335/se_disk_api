import models from "../database/models";

export default class PostService {

    async CreatePost(projectId, userId, postInput) {
        try {
            const post = await models.posts.create({
                ...postInput,
                project_id: projectId,
                user_id: userId
            })
            return post;
        } catch (e) {
            throw e;
        }
    }

    async UpdatePost(postId, postInput) {
        try {
            const changeRaws = await models.posts.update({
                ...postInput
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
            return post;
        } catch (e) {
            throw e;
        }
    }
}