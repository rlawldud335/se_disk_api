import models from "../database/models";

export default class CommentService {

    async CreateComment(userId, projectId, commentInput) {
        try {
            const comment = await models.comments.create({
                ...commentInput,
                user_id: userId,
                project_id: projectId
            })
            return comment;
        } catch (e) {
            throw e;
        }
    }
    async UpdateComment(commentId, commentInput) {
        try {
            await models.comments.update({
                comment_content: commentInput.comment_content
            }, {
                where: {
                    comment_id: commentId
                },
                raw: true
            })
            const comment = await models.comments.findOne({
                where: {
                    comment_id: commentId
                },
                raw: true
            })
            return comment;
        } catch (e) {
            throw e;
        }
    }
    async DeleteComment(commentId) {
        try {
            //commentId가 부모인 모든 comment를 삭제
            await models.comments.destroy({
                where: {
                    comment_parent: commentId
                }
            })
            await models.comments.destroy({
                where: {
                    comment_id: commentId
                }
            })
        } catch (e) {
            throw e;
        }
    }

    async GetProjectComments(projectId) {
        try {
            console.log(projectId);
            const { count, rows } = await models.comments.findAndCountAll({
                attributes: ['comments.*', 'user.user_name'],
                where: { project_id: projectId },
                raw: true,
                include: {
                    model: models.users,
                    as: 'user',
                    attributes: []
                }
            })
            return { comments: rows, count };
        } catch (e) {
            throw e;
        }
    }
}