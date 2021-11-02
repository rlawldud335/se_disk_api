import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';

import ProjectService from '../../services/project';
import middlewares from '../middlewares';

const route = Router();
const ProjectInstance = new ProjectService();

export default (app) => {
    app.use('/project', route);

    app.use('/project-count',
        async (req, res, next) => {
            try {
                const projectCnt = await ProjectInstance.GetProjectCount();
                return res.status(200).json({ sucess: true, projectCnt });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        });

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
                return res.status(200).json({ sucess: false, errorMsg: e.message });
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
                return res.status(200).json({ sucess: false, errorMsg: e.message });
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
                return res.status(200).json({ sucess: false, errorMsg: e.message });
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
                project_image: Joi.string().allow(null),
                project_subject: Joi.string().allow(null),
                project_subject_year: Joi.number().allow(null),
                project_professor: Joi.number().allow(null),
                project_category: Joi.string().allow(null),
                project_leader: Joi.number(),
                project_members: Joi.array().items(Joi.number()).allow(null),
                project_tags: Joi.array().items(Joi.number()).allow(null)
            }
        }),
        async (req, res, next) => {
            try {
                const { projectId } = req.params;
                const project = await ProjectInstance.UpdateProject(projectId, req.body);
                return res.status(200).json({ sucess: true, project });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    route.get(
        '/',
        celebrate({
            query: {
                pageNum: Joi.number().required(),
                pageCount: Joi.number().required()
            }
        }),
        async (req, res, next) => {
            try {
                const { pageNum, pageCount } = req.query;
                const projects = await ProjectInstance.GetAllProject(pageNum, pageCount);
                return res.status(200).json({ sucess: true, projects });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    route.post(
        '/',
        celebrate({
            body: {
                project_title: Joi.string().required(),
                project_category: Joi.string().required(),
                project_leader: Joi.number().required(),
                project_image: Joi.string().allow(null),
                project_subject: Joi.string().allow(null),
                project_subject_year: Joi.number().allow(null),
                project_professor: Joi.number().allow(null),
                project_members: Joi.array().items(Joi.number()).allow(null),
                project_tags: Joi.array().items(Joi.number()).allow(null),
                project_content: Joi.string().allow(null)
            }
        }),
        async (req, res, next) => {
            try {
                console.log(req.body);
                const project = await ProjectInstance.CreateProject(req.body);
                return res.status(200).json({ sucess: true, project });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

};