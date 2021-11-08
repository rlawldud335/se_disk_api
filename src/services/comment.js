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
                ...commentInput
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
            await models.comments.distroy({
                where: {
                    comment_parent: commentId
                }
            })
            await models.comment.distroy({
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
            console.log(projectId)
            const comments = await models.comments.findAndCountAll({
                where: { project_id: projectId },
                raw: true
            })
            console.log(comments);
            return comments;
        } catch (e) {
            throw e;
        }
    }
}