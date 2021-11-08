import models from "../database/models";

export default class PostService {

    async CreatePost(projectId, userId, postInput) {
        try {
            const post = await models.posts.create({
                ...postInput,
                project_id: projectId,
                user_id: userId,
            })
            return post;
        } catch (e) {
            throw e;
        }
    }

    async UpdatePost(projectId, postId, postInput) {
        try {
            await models.posts.update({
                ...postInput
            }, {
                where: {
                    project_id: projectId
                },
                raw: true
            })
            const post = await models.posts.findOne({
                where: {
                    post_id: postId
                },
                raw: true
            })
            return post;
        } catch (e) {
            throw e;
        }
    }

    async GetPost(postId) {
        try {
            const post = await models.posts.findOne({
                where: { post_id: postId },
                raw: true
            })
            return post;
        } catch (e) {
            throw e;
        }
    }

    async GetPostList(projectId) {
        try {
            const posts = await models.posts.findAndCountAll({
                where: { project_id: projectId },
                raw: true
            })
            return { count: posts.count, posts: posts.rows };
        } catch (e) {
            throw e;
        }
    }
}