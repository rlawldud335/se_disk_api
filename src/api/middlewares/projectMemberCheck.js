import models from "../../database/models";
import jwt from "jsonwebtoken";
import config from "../../config";

const projectMemberCheck = async (req, res, next) => {
    try {
        const {_id:userId} = jwt.verify(req.headers.authorization.split(' ')[1], config.jwtSecret);
        const { projectId } = req.params;
        const project = await models.possessions.findOne({where:{user_id:userId, project_id:projectId},raw:true});
        console.log(project);
        if(!project){
            throw new Error("프로젝트의 팀원이 아닙니다! ( 접근 권한이 없습니다! )");
        }
        return next();
    } catch (e) {
        return next(e);
    }
};

export default projectMemberCheck;