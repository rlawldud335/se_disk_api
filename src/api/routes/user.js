import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';

import UserService from '../../services/user';
import middlewares from '../middlewares';

const route = Router();
const UserInstance = new UserService();

export default (app) => {
    app.use('/user', route);

    //내가 작성한 팀원 모집글 조회
    route.get('/:userId/recruitment',
        celebrate({
            params: {
                userId: Joi.number().required()
            },
            query: {
                pageNum: Joi.number().required(),
                pageCount: Joi.number().required()
            }
        }),
        async (req, res, next) => {
            try {
                const { userId } = req.params;
                const { pageNum, pageCount } = req.query;
                const { recruitments, count } = await UserInstance.GetMyRecruitments(userId, pageNum, pageCount);
                return res.status(200).json({ sucess: true, count, recruitments });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    //사용자 loginId 검색
    route.get('/search/loginId',
        celebrate({
            query: {
                loginId: Joi.string().required()
            }
        }),
        async (req, res, next) => {
            try {
                const { loginId } = req.query;
                const users = await UserInstance.GetLoginId(loginId);
                return res.status(200).json({ sucess: true, users });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    //교수님 리스트 조회
    route.get(
        '/professors',
        async (req, res, next) => {
            try {
                const professors = await UserInstance.GetProfessors();
                return res.status(200).json({ sucess: true, professors });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    //팔로우
    route.get(
        '/follow',
        middlewares.isAuth,
        celebrate({
            query: {
                targetId: Joi.number().required()
            }
        }),
        async (req, res, next) => {
            try {
                const userId = req.user._id;
                const { targetId } = req.query;
                const { isNewRecord, count } = await UserInstance.CreateFollow(userId, targetId);
                return res.status(200).json({ sucess: true, isNewRecord, count });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )
    //언팔로우
    route.get(
        '/unfollow',
        middlewares.isAuth,
        celebrate({
            query: {
                targetId: Joi.number().required()
            }
        }),
        async (req, res, next) => {
            try {
                const userId = req.user._id;
                const { targetId } = req.query;
                const { isDeleted, count } = await UserInstance.DeleteFollow(userId, targetId);
                return res.status(200).json({ sucess: true, count, isDeleted });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )
    //회원탈퇴
    route.delete(
        '/:userId',
        middlewares.isAuth,
        celebrate({
            params: {
                userId: Joi.number().required()
            }
        }),
        middlewares.userOwnerCheck,
        async (req, res, next) => {
            try {
                const {userId} = req.params;
                const result = await UserInstance.DeleteUser(userId);
                return res.status(200).json({ sucess: result });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        },
    );

    //회원정보 조회
    route.get(
        '/:userId',
        middlewares.isAuth,
        celebrate({
            params: {
                userId: Joi.number().required()
            }
        }),
        async (req, res, next) => {
            try {
                const { userId } = req.params;
                const user = await UserInstance.GetUser(userId);
                return res.status(200).json({ sucess: true, user });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    //회원정보 수정
    route.post(
        '/:userId',
        middlewares.isAuth,
        celebrate({
            body: Joi.object({
                user_email: Joi.string().optional(),
                user_type: Joi.string().optional(),
                user_name: Joi.string().optional(),
                user_school_num: Joi.string().optional(),
                user_image: Joi.string().optional().allow(null).allow(""),
                user_introduction: Joi.string().optional().allow(null).allow(""),
                user_github: Joi.string().optional().allow(null).allow(""),
                user_blog: Joi.string().optional().allow(null).allow(""),
                user_position: Joi.string().optional().allow(null).allow(""),
            }),
            params: {
                userId: Joi.number().required()
            }
        }),
        middlewares.userOwnerCheck,
        async (req, res, next) => {
            try {
                const { userId } = req.params;
                const user = await UserInstance.UpdateUser(userId, req.body);
                return res.status(200).json({ sucess: true, user });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    );

    //사용자의 프로젝트 리스트 조회
    route.get(
        '/:userId/projects',
        middlewares.isAuth,
        celebrate({
            params: {
                userId: Joi.number().required()
            },
            query: {
                pageNum: Joi.number().required(),
                pageCount: Joi.number().required()
            }
        }),
        async (req, res, next) => {
            try {
                const { userId } = req.params;
                const { pageNum, pageCount } = req.query;
                const { projects, count } = await UserInstance.GetUserProject(userId, pageNum, pageCount);
                return res.status(200).json({ sucess: true, count, projects });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    //사용자의 좋아요한 프로젝트 리스트 조회
    route.get(
        '/:userId/like-projects',
        celebrate({
            params: {
                userId: Joi.number().required()
            },
            query: {
                pageNum: Joi.number().required(),
                pageCount: Joi.number().required()
            }
        }),
        async (req, res, next) => {
            try {
                const { userId } = req.params;
                const { pageNum, pageCount } = req.query;
                const { projects, count } = await UserInstance.GetUserLikeProject(userId, pageNum, pageCount);
                return res.status(200).json({ sucess: true, count, projects });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    //팔로워리스트조회
    route.get(
        '/:userId/followers',
        celebrate({
            params: {
                userId: Joi.number().required()
            }
        }),
        async (req, res, next) => {
            try {
                const { userId } = req.params;
                const { followers, count } = await UserInstance.GetFollower(userId);
                return res.status(200).json({ sucess: true, count, followers });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )
    //팔로잉리스트조회
    route.get(
        '/:userId/followings',
        celebrate({
            params: {
                userId: Joi.number().required()
            }
        }),
        async (req, res, next) => {
            try {
                const { userId } = req.params;
                const { followings, count } = await UserInstance.GetFollowing(userId);
                return res.status(200).json({ sucess: true, count, followings });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    //회원가입
    route.post(
        '/',
        celebrate({
            body: Joi.object({
                user_login_id: Joi.string().required(),
                user_email: Joi.string().optional().allow(null).allow(""),
                user_password: Joi.string().required(),
                user_type: Joi.string().required(),
                user_name: Joi.string().required(),
                user_school_num: Joi.string().required(),
                user_image: Joi.string().optional().allow(null).allow(""),
                user_introduction: Joi.string().optional().allow(null).allow(""),
                user_github: Joi.string().optional().allow(null).allow(""),
                user_blog: Joi.string().optional().allow(null).allow(""),
                user_position: Joi.string().optional().allow(null).allow(""),
            })
        }),
        async (req, res, next) => {
            try {
                const { user, token } = await UserInstance.CreateUser(req.body);
                return res.status(200).json({ success: true, user, token });
            } catch (e) {
                return res.status(200).json({ success: false, errorMsg: e.message });
            }
        },
    );
};