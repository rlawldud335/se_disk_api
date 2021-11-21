import models from "../../database/models";
import jwt from "jsonwebtoken";
import config from "../../config";

const recruitmentOwnerCheck = async (req, res, next) => {
    try {
        const {_id:userId} = jwt.verify(req.headers.authorization.split(' ')[1], config.jwtSecret);
        const { recruitmentId } = req.params;
        const recruitment = await models.recruitments.findOne({where:{recruitment_id:recruitmentId},raw:true});
        if(recruitment.user_id!=userId){
            throw new Error("팀원 모집글 작성자가 아닙니다! ( 접근 권한이 없습니다! )");
        }
        return next();
    } catch (e) {
        return next(e);
    }
};

export default recruitmentOwnerCheck;