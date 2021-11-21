import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';

import CommentService from '../../services/comment';
import middlewares from '../middlewares';

const route = Router();
const CommentInstance = new CommentService();

export default (app) => {
    app.use('/project', route);

    //댓글 생성
    route.post(
        '/:projectId/comment/',
        middlewares.isAuth,
        celebrate({
            params: {
                projectId: Joi.number().required()
            },
            body: {
                comment_content: Joi.string().required(),
                comment_depth: Joi.number().required(),
                comment_parent: Joi.number().optional().allow(null).allow("")
            },
        }),
        async (req, res, next) => {
            try {
                const userId = req.user._id;
                const { projectId } = req.params;
                const comment = await CommentInstance.CreateComment(userId, projectId, req.body);
                return res.status(200).json({ sucess: true, comment });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    //댓글 수정
    route.post(
        '/:projectId/comment/:commentId',
        middlewares.isAuth,
        celebrate({
            params: {
                projectId: Joi.number().required(),
                commentId: Joi.number().required()
            },
            body: {
                comment_content: Joi.string().required()
            },
        }),
        middlewares.commentOwnerCheck,
        async (req, res, next) => {
            try {
                const { commentId } = req.params;
                const comment = await CommentInstance.UpdateComment(commentId, req.body);
                return res.status(200).json({ sucess: true, comment });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    // //댓글 삭제
    route.delete(
        '/:projectId/comment/:commentId',
        middlewares.isAuth,
        celebrate({
            params: {
                projectId: Joi.number().required(),
                commentId: Joi.number().required(),
            },
        }),
        middlewares.commentOwnerCheck,
        async (req, res, next) => {
            try {
                const { commentId } = req.params;
                await CommentInstance.DeleteComment(commentId);
                return res.status(200).json({ sucess: true });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    //댓글 조회
    route.get(
        '/:projectId/comment/',
        celebrate({
            params: {
                projectId: Joi.number().required(),
            }
        }),
        async (req, res, next) => {
            try {
                const { projectId } = req.params;
                const { comments, count } = await CommentInstance.GetProjectComments(projectId);
                return res.status(200).json({ sucess: true, count, comments });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )
};