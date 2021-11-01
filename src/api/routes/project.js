import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';

import ProjectService from '../../services/project';
import middlewares from '../middlewares';

const route = Router();
const ProjectInstance = new ProjectService();

export default (app) => {
    app.use('/project', route);

    route.get('/like',
        middlewares.isAuth,
        celebrate({
            query: {
                projectId: Joi.number().required()
            }
        }),
        async (req, res, next) => {
            try {
                const userId = req.user._id;
                const { projectId } = req.query;
                const like = await ProjectInstance.CreateLike(userId, projectId);
                return res.status(200).json({ sucess: true, isNewRecord: like[1] });
            } catch (e) {
                return res.status(500).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    route.get('/unlike',
        middlewares.isAuth,
        celebrate({
            query: {
                projectId: Joi.number().required()
            }
        }),
        async (req, res, next) => {
            try {
                const userId = req.user._id;
                const { projectId } = req.query;
                await ProjectInstance.DeleteLike(userId, projectId);
                return res.status(200).json({ sucess: true });
            } catch (e) {
                return res.status(500).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    route.get(
        '/:projectId',
        celebrate({
            params: {
                projectId: Joi.number().required()
            }
        }),
        async (req, res, next) => {
            try {
                const { projectId } = req.params;
                const project = await ProjectInstance.GetProject(projectId);
                return res.status(200).json({ sucess: true, project });
            } catch (e) {
                return res.status(500).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    route.post(
        '/:projectId',
        celebrate({
            params: {
                projectId: Joi.number().required()
            },
            body: {
                project_title: Joi.string(),
                project_image: Joi.string(),
                project_subject: Joi.string(),
                project_subject_year: Joi.number(),
                project_professor: Joi.number(),
                project_category: Joi.string(),
                project_leader: Joi.number(),
                project_members: Joi.array().items(Joi.number()),
                project_tags: Joi.array().items(Joi.number())
            }
        }),
        async (req, res, next) => {
            try {
                const { projectId } = req.params;
                const project = await ProjectInstance.UpdateProject(projectId, req.body);
                return res.status(200).json({ sucess: true, project });
            } catch (e) {
                return res.status(500).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    route.post(
        '/',
        celebrate({
            body: {
                project_title: Joi.string().required(),
                project_image: Joi.string(),
                project_subject: Joi.string(),
                project_subject_year: Joi.number(),
                project_professor: Joi.number(),
                project_category: Joi.string().required(),
                project_leader: Joi.number().required(),
                project_members: Joi.array().items(Joi.number()),
                project_tags: Joi.array().items(Joi.number())
            }
        }),
        async (req, res, next) => {
            try {
                console.log(req.body);
                const project = await ProjectInstance.CreateProject(req.body);
                return res.status(200).json({ sucess: true, project });
            } catch (e) {
                return res.status(500).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

};