import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';

import middlewares from '../middlewares';
import RecruitmentService from "../../services/recruitment";
const jwt = require('jsonwebtoken');
import config from "../../config";

const RecruitmentInstance = new RecruitmentService();
const route = Router();

export default (app) => {
    app.use('/recruitment', route);

    //팀원 모집글 생성
    route.post('/',
        middlewares.isAuth,
        celebrate({
            body: {
                recruitment_title: Joi.string().required(),
                recruitment_recruited_limit: Joi.number().required(),
                recruitment_deadline_date: Joi.string().required(),
                recruitment_subject: Joi.string().optional().allow(null).allow(""),
                recruitment_content: Joi.string().optional().allow(null).allow(""),
            }
        }),
        async (req, res, next) => {
            try {
                const userId = req.user._id;
                const recruitment = await RecruitmentInstance.CreateRecruitment(userId, req.body);
                return res.status(200).json({ sucess: true, recruitment });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    //팀원 모집글 수정
    route.post('/:recruitmentId',
        middlewares.isAuth,
        celebrate({
            params: {
                recruitmentId: Joi.number().required()
            },
            body: {
                recruitment_title: Joi.string().required(),
                recruitment_recruited_limit: Joi.number().required(),
                recruitment_deadline_date: Joi.string().required(),
                recruitment_subject: Joi.string().optional().allow(null).allow(""),
                recruitment_content: Joi.string().optional().allow(null).allow(""),
            }
        }),
        async (req, res, next) => {
            try {
                const { recruitmentId } = req.params;
                const recruitment = await RecruitmentInstance.UpdateRecruitment(recruitmentId, req.body);
                return res.status(200).json({ sucess: true, recruitment });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    //전체 팀원 모집글 조회
    route.get('/',
        celebrate({
            query: {
                pageNum: Joi.number().required(),
                pageCount: Joi.number().required()
            }
        }),
        async (req, res, next) => {
            try {
                const { pageNum, pageCount } = req.query;
                const { recruitments, count } = await RecruitmentInstance.GetAllRecruitment(pageNum, pageCount);
                return res.status(200).json({ sucess: true, count, recruitments });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    //팀원 모집글 검색
    route.get('/search',
        celebrate({
            query: {
                pageNum: Joi.number().required(),
                pageCount: Joi.number().required(),
                keyword: Joi.string().optional().allow(null).allow(""),
                subject: Joi.string().optional().allow(null).allow(""),
            }
        }),
        async (req, res, next) => {
            try {
                const { pageNum, pageCount, keyword, subject } = req.query;
                const { recruitments, count } = await RecruitmentInstance.SearchRecruitment(pageNum, pageCount, keyword, subject);
                return res.status(200).json({ sucess: true, count, recruitments });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        })

    //팀원모집글 상세조회
    route.get('/:recruitmentId',
        celebrate({
            params: {
                recruitmentId: Joi.string().required()
            }
        }),
        async (req, res, next) => {
            try {
                let userId;
                if (req.headers.authorization) {
                    const user = jwt.verify(req.headers.authorization.split(' ')[1], config.jwtSecret);
                    userId = user._id;
                }
                const { recruitmentId } = req.params;
                const recruitment = await RecruitmentInstance.GetRecruitment(recruitmentId, userId);
                return res.status(200).json({ sucess: true, recruitment });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        })

    //팀원모집글 마감
    route.get(
        '/:recruitmentId/end',
        celebrate({
            params: {
                recruitmentId: Joi.string().required()
            }
        }),
        async (req, res, next) => {
            try {
                const { recruitmentId } = req.params;
                await RecruitmentInstance.EndRecruitment(recruitmentId);
                return res.status(200).json({ sucess: true });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    //팀원 신청
    //자기자신은 신청못하게 막기
    //여러번신청막기
    route.get('/:recruitmentId/application',
        middlewares.isAuth,
        celebrate({
            params: {
                recruitmentId: Joi.number().required()
            }
        }),
        async (req, res, next) => {
            try {
                const { recruitmentId } = req.params;
                const userId = req.user._id;
                const application = await RecruitmentInstance.CreateApplication(recruitmentId, userId);
                return res.status(200).json({ sucess: true, application });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    //팀원 신청 취소
    route.delete('/:recruitmentId/application',
        middlewares.isAuth,
        celebrate({
            params: {
                recruitmentId: Joi.number().required()
            }
        }),
        async (req, res, next) => {
            try {
                const { recruitmentId } = req.params;
                const userId = req.user._id;
                await RecruitmentInstance.DeleteApplication(recruitmentId, userId);
                return res.status(200).json({ sucess: true });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    //팀원 신청 승락
    route.get('/:recruitmentId/accept',
        middlewares.isAuth,
        celebrate({
            query: {
                userId: Joi.number().required()
            },
            params: {
                recruitmentId: Joi.number().required()
            }
        }),
        async (req, res, next) => {
            try {
                const { recruitmentId } = req.params;
                const myUserId = req.user._id;
                const { userId } = req.query;
                await RecruitmentInstance.AcceptApplication(recruitmentId, userId);
                return res.status(200).json({ sucess: true });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    //팀원 신청 거절
    route.get('/:recruitmentId/refuse',
        middlewares.isAuth,
        celebrate({
            query: {
                userId: Joi.number().required()
            },
            params: {
                recruitmentId: Joi.number().required()
            }
        }),
        async (req, res, next) => {
            try {
                const { recruitmentId } = req.params;
                const myUserId = req.user._id;
                const { userId } = req.query;
                await RecruitmentInstance.RefuseApplication(recruitmentId, userId);
                return res.status(200).json({ sucess: true });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )
};