import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';

import UserService from '../../services/user';
import middlewares from '../middlewares';

const route = Router();
const UserInstance = new UserService();

export default (app) => {
    app.use('/user', route);

    route.delete(
        '/:userId',
        celebrate({
            params: {
                userId: Joi.number().required()
            }
        }),
        async (req, res, next) => {
            try {
            } catch (e) {
                return next(e);
            }
        },
    );

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
                return res.status(500).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    route.post(
        '/:userId',
        middlewares.isAuth,
        celebrate({
            body: Joi.object({
                user_email: Joi.string(),
                user_type: Joi.string(),
                user_name: Joi.string(),
                user_school_num: Joi.string(),
                user_image: Joi.string(),
                user_introduction: Joi.string(),
                user_github: Joi.string(),
                user_blog: Joi.string(),
                user_position: Joi.string(),
                user_notification_stat: Joi.number().integer().min(0).max(1),
            }),
            params: {
                userId: Joi.number().required()
            }
        }),
        async (req, res, next) => {
            try {
                const { userId } = req.params;
                const user = await UserInstance.UpdateUser(userId, req.body);
                return res.status(200).json({ sucess: true, user });
            } catch (e) {
                return res.status(500).json({ sucess: false, errorMsg: e.message });
            }
        }
    );

    route.get(
        '/:userId/follow',
        celebrate({
            query: {
                targetId: Joi.number().required()
            },
            params: {
                userId: Joi.number().required()
            }
        }),
        async (req, res, next) => {
            try {
                const { userId } = req.params;
                const { targetId } = req.query;
                const follow = await UserInstance.CreateFollow(userId, targetId);
                return res.status(200).json({ sucess: true, follow: follow[0], isNewRecord: follow[1] });
            } catch (e) {
                return res.status(500).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    route.get(
        '/:userId/follower',
        celebrate({
            params: {
                userId: Joi.number().required()
            }
        }),
        async (req, res, next) => {
            try {
                const { userId } = req.params;
                const followers = await UserInstance.GetFollower(userId);
                return res.status(200).json({ sucess: true, followers });
            } catch (e) {
                return res.status(500).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    route.get(
        '/:userId/following',
        celebrate({
            params: {
                userId: Joi.number().required()
            }
        }),
        async (req, res, next) => {
            try {
                const { userId } = req.params;
                const followings = await UserInstance.GetFollowing(userId);
                return res.status(200).json({ sucess: true, followings });
            } catch (e) {
                return res.status(500).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    route.post(
        '/',
        celebrate({
            body: Joi.object({
                user_login_id: Joi.string().required(),
                user_password: Joi.string().required(),
                user_email: Joi.string().required(),
                user_type: Joi.string().required(),
                user_name: Joi.string().required(),
                user_school_num: Joi.string().required(),
            })
        }),
        async (req, res, next) => {
            try {
                const { user, token } = await UserInstance.CreateUser(req.body);
                return res.status(200).json({ success: true, user, token });
            } catch (e) {
                return res.status(500).json({ success: false, errorMsg: e.message });
            }
        },
    );
};