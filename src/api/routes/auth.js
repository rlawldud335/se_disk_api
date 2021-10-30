import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';

import AuthService from '../../services/auth';
import middlewares from '../middlewares';

const route = Router();
const AuthInstance = new AuthService();

export default (app) => {
    app.use('/auth', route);

    route.post(
        '/login',
        celebrate({
            body: Joi.object({
                user_login_id: Joi.string().required(),
                user_password: Joi.string().required(),
            }),
        }),
        async (req, res, next) => {
            try {
                const { user_login_id, user_password } = req.body;
                const { user, token } = await AuthInstance.LogIn(user_login_id, user_password);
                return res.status(200).json({ sucess: true, user, token });
            } catch (e) {
                return res.status(500).json({ sucess: false, errorMsg: e.message });
            }
        },
    );

    route.get('/logout', middlewares.isAuth, (req, res, next) => {
        try {
            return res.status(200).json({ sucess: true });
        } catch (e) {
            return res.status(500).json({ sucess: false, errorMsg: e.message });
        }
    });

    route.get('/doubleId',
        celebrate({
            query: {
                loginId: Joi.string().required()
            },
        }),
        async (req, res, next) => {
            try {
                const { loginId } = req.query;
                const isDouble = await AuthInstance.DoubleCheckId(loginId);
                return res.status(200).json({ sucess: true, isDouble });
            } catch (e) {
                return res.status(500).json({ sucess: false, errorMsg: e.message });
            }
        })

    route.get('/email',
        celebrate({
            query: {
                email: Joi.string().required()
            },
        }),
        async (req, res, next) => {
            try {
                const { email } = req.query;
                const emailId = await AuthInstance.SendEmail(email);
                res.status(200).json({ sucess: true, emailId });
            } catch (e) {
                return res.status(500).json({ sucess: false, errorMsg: e.message });
            }
        })

    route.post('/email',
        celebrate({
            body: Joi.object({
                emailId: Joi.string().required(),
                authStr: Joi.string().required(),
            }),
        }),
        async (req, res, next) => {
            try {
                const { emailId, authStr } = req.body;
                const isAuth = await AuthInstance.AuthEmail(emailId, authStr);
                res.status(200).json({ sucess: true, isAuth });
            } catch (e) {
                return res.status(500).json({ sucess: false, errorMsg: e.message });
            }
        })
};