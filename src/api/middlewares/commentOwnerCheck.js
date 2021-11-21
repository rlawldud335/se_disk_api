import models from "../../database/models";
import jwt from "jsonwebtoken";
import config from "../../config";

const commentOwnerCheck = async (req, res, next) => {
    try {
        const {_id:userId} = jwt.verify(req.headers.authorization.split(' ')[1], config.jwtSecret);
        const { commentId } = req.params;
        const comment = await models.comments.findOne({where:{comment_id:commentId},raw:true});
        console.log(comment);
        if(comment.user_id != userId){
            throw new Error("댓글 작성자가 아닙니다! ( 접근 권한이 없습니다! )");
        }
        return next();
    } catch (e) {
        return next(e);
    }
};

export default commentOwnerCheck;