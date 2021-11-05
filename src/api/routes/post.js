import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';

import PostService from '../../services/post';
import middlewares from '../middlewares';

const route = Router();
const PostInstance = new PostService();

export default (app) => {
    app.use('/project/:projectId/post', route);

    //게시글 리스트 조회
    app.use('/project/:projectId/post-list', celebrate({
        params: {
            projectId: Joi.number().required()
        }
    }),
        async (req, res, next) => {
            try {
                const { projectId } = req.params;
                const result = await PostInstance.GetUserId(projectId);
                return res.status(200).json({ sucess: true, result });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    //게시글 생성
    route.post(
        '/',
        middlewares.isAuth,
        celebrate({
            params: {
                projectId: Joi.number().required()
            },
            body: Joi.object({
                post_title: Joi.string().required(),
                post_content: Joi.string().allow(null),
                post_num: Joi.number().required()
            }),
        }),
        async (req, res, next) => {
            try {
                const userId = req.user._id;
                const { projectId } = req.params;
                const post = await PostInstance.CreatePost(projectId, userId, req.body);
                return res.status(200).json({ sucess: true, post });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    //게시글 수정
    route.post(
        '/:postId',
        celebrate({
            params: {
                projectId: Joi.number().required()
            },
            body: Joi.object({
                post_title: Joi.string(),
                post_content: Joi.string().allow(null),
                post_num: Joi.number()
            }),
        }),
        async (req, res, next) => {
            try {
                const { projectId } = req.params;
                const result = await PostInstance.GetUserId(projectId);
                return res.status(200).json({ sucess: true, result });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    //게시글 삭제
    route.delete(
        '/:postId',
        celebrate({
            params: {
                projectId: Joi.number().required()
            },
        }),
        async (req, res, next) => {
            try {
                const { projectId } = req.params;
                const result = await PostInstance.GetUserId(projectId);
                return res.status(200).json({ sucess: true, result });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    //게시글 조회
    route.get(
        '/:postId',
        celebrate({
            params: {
                projectId: Joi.number().required()
            },
        }),
        async (req, res, next) => {
            try {
                const { projectId } = req.params;
                const result = await PostInstance.GetUserId(projectId);
                return res.status(200).json({ sucess: true, result });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

};