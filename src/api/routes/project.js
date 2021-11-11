import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';

import ProjectService from '../../services/project';
import middlewares from '../middlewares';
import Categorys from "../../database/Category";

const route = Router();
const ProjectInstance = new ProjectService();

export default (app) => {

    app.use('/project', route);

    //전체 프로젝트 갯수 조회
    app.use('/project-count',
        async (req, res, next) => {
            try {
                const projectCnt = await ProjectInstance.GetProjectCount();
                return res.status(200).json({ sucess: true, projectCnt });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    );

    //프로젝트 검색 (기술스택 and 과목명 and 년도 and 지도교수 and 프로젝트명)
    route.post('/serach',
        celebrate({
            query: {
                pageCount: Joi.number().required(),
                pageNum: Joi.number().required()
            },
            body: {
                tag: Joi.array().items(Joi.string()).optional(),
                subject: Joi.array().items(Joi.string()).optional(),
                year: Joi.array().items(Joi.number()).optional(),
                professor: Joi.array().items(Joi.number()).optional(),
                keyword: Joi.string().optional()
            }
        }),
        async (req, res, next) => {
            try {
                const { pageCount, pageNum } = req.query;
                const { projects, count } = await ProjectInstance.SearchProject(req.body, pageNum, pageCount);
                return res.status(200).json({ sucess: true, count, projects });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    //카테고리별 프로젝트 조회
    route.get('/search/category',
        celebrate({
            query: {
                categoryId: Joi.string().required(),
                pageNum: Joi.number().required(),
                pageCount: Joi.number().required()
            }
        }),
        async (req, res, next) => {
            try {
                const { categoryId, pageNum, pageCount } = req.query;
                const { projects, count } = await ProjectInstance.GetCategoryProject(categoryId, pageNum, pageCount);
                return res.status(200).json({ sucess: true, count, projects });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    //프로젝트 태그 검색
    route.get('/search/tag',
        celebrate({
            query: {
                tagId: Joi.string().required()
            }
        }),
        async (req, res, next) => {
            try {
                const { tagId } = req.query;
                const tags = await ProjectInstance.GetProjectTag(tagId);
                return res.status(200).json({ sucess: true, tags });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )



    //프로젝트 과목 리스트 조회
    route.get('/categorys',
        async (req, res, next) => {
            try {
                return res.status(200).json({ sucess: true, categorys: Categorys.categorys });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    );

    //프로젝트 과목년도 리스트 조회
    route.get('/subject-years',
        async (req, res, next) => {
            try {
                return res.status(200).json({ sucess: true, years: Categorys.years });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    );

    //프로젝트 과목 리스트 조회
    route.get('/subjects',
        async (req, res, next) => {
            try {
                return res.status(200).json({ sucess: true, subjects: Categorys.subjects });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    );

    //프로젝트 좋아요 여부 확인
    route.get('/isLike',
        middlewares.isAuth,
        celebrate({
            query: {
                projectId: Joi.number().required()
            }
        }),
        async (req, res, next) => {
            try {
                const userId = req.user._id;
                console.log(userId);
                const { projectId } = req.query;
                const isLike = await ProjectInstance.isLikeProject(userId, projectId);
                return res.status(200).json({ sucess: true, isLike });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    //프로젝트 태그 전체조회
    route.get('/tags',
        async (req, res, next) => {
            try {
                const tags = await ProjectInstance.GetAllTags();
                return res.status(200).json({ sucess: true, tags });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        });

    //프로젝트 좋아요
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
                const { isNewRecord, count } = await ProjectInstance.CreateLike(userId, projectId);
                return res.status(200).json({ sucess: true, isNewRecord, count });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    //프로젝트 좋아요 취소
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
                const count = await ProjectInstance.DeleteLike(userId, projectId);
                return res.status(200).json({ sucess: true, count });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    //프로젝트 상세조회 
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

    //프로젝트 수정
    route.post(
        '/:projectId',
        middlewares.isAuth,
        celebrate({
            params: {
                projectId: Joi.number().required()
            },
            body: {
                project_title: Joi.string().optional(),
                project_image: Joi.string().optional().allow(null).allow(""),
                project_subject: Joi.string().optional().allow(null).allow(""),
                project_subject_year: Joi.number().optional().allow(null).allow(""),
                project_professor: Joi.number().optional().allow(null).allow(""),
                project_categorys: Joi.array().items(Joi.string()).optional().allow(null).allow(""),
                project_leader: Joi.number().optional(),
                project_members: Joi.array().items(Joi.number()).optional().allow(null).allow(""),
                project_tags: Joi.array().items(Joi.string()).optional().allow(null).allow(""),
                project_introduction: Joi.string().optional().allow(null).allow("")
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

    //프로젝트 조회수 증가
    route.get('/:projectId/hit',
        celebrate({
            params: {
                projectId: Joi.number().required()
            }
        }),
        async (req, res, next) => {
            try {
                const { projectId } = req.params;
                const count = await ProjectInstance.UpProjectHit(projectId);
                return res.status(200).json({ sucess: true, count });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    //모든 프로젝트 조회
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
                const { projects, count } = await ProjectInstance.GetAllProject(pageNum, pageCount);
                return res.status(200).json({ sucess: true, count, projects });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    //프로젝트 생성
    route.post(
        '/',
        middlewares.isAuth,
        celebrate({
            body: {
                project_title: Joi.string().required(),
                project_leader: Joi.number().required(),
                project_image: Joi.string().optional().allow(null).allow(""),
                project_subject: Joi.string().optional().allow(null).allow(""),
                project_subject_year: Joi.number().optional().allow(null).allow(""),
                project_professor: Joi.number().optional().allow(null).allow(""),
                project_members: Joi.array().items(Joi.number()).optional().allow(null).allow(""),
                project_categorys: Joi.array().items(Joi.string()).optional().allow(null).allow(""),
                project_tags: Joi.array().items(Joi.string()).optional().allow(null).allow(""),
                project_introduction: Joi.string().optional().allow(null).allow("")
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