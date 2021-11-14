import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';

import PostService from '../../services/post';
import middlewares from '../middlewares';

const route = Router();
const PostInstance = new PostService();

export default (app) => {
    app.use('/project', route);

    //게시글 생성
    route.post(
        '/:projectId/post/',
        middlewares.isAuth,
        celebrate({
            params: {
                projectId: Joi.number().required()
            },
            body: {
                post_title: Joi.string().required(),
                post_content: Joi.string().optional().allow(null).allow(""),
                post_files: Joi.array().items(Joi.number()).optional().allow(null).allow("")
            },
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
        '/:projectId/post/:postId',
        middlewares.isAuth,
        celebrate({
            params: {
                projectId: Joi.number().required(),
                postId: Joi.number().required()
            },
            body: Joi.object({
                post_title: Joi.string().optional(),
                post_content: Joi.string().optional().allow(null).allow(""),
                post_files: Joi.array().items(Joi.number()).optional().allow(null).allow("")
            }),
        }),
        async (req, res, next) => {
            try {
                const { projectId, postId } = req.params;
                const result = await PostInstance.UpdatePost(projectId, postId, req.body);
                return res.status(200).json({ sucess: true, result });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    //게시글 삭제
    route.delete(
        '/:projectId/post/:postId',
        middlewares.isAuth,
        async (req, res, next) => {
            try {
                return res.status(200).json({ sucess: true });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    //게시글 조회
    route.get(
        '/:projectId/post/:postId',
        celebrate({
            params: {
                projectId: Joi.number().required(),
                postId: Joi.number().required()
            }
        }),
        async (req, res, next) => {
            try {
                const { postId } = req.params;
                const result = await PostInstance.GetPost(postId);
                return res.status(200).json({ sucess: true, result });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    //프로젝트 게시물 리스트 조회
    route.get('/:projectId/post-list', celebrate({
        params: {
            projectId: Joi.number().required()
        }
    }),
        async (req, res, next) => {
            try {
                const { projectId } = req.params;
                const { count, posts } = await PostInstance.GetPostList(projectId);
                return res.status(200).json({ sucess: true, count, posts });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )
};