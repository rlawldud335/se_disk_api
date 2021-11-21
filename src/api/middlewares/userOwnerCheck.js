import jwt from "jsonwebtoken";
import config from "../../config";

const userOwnerCheck = async (req, res, next) => {
    try {
        const {_id:loginUserId} = jwt.verify(req.headers.authorization.split(' ')[1], config.jwtSecret);
        const { userId } = req.params;
        if(loginUserId != userId){
            throw new Error("계정주인이 아닙니다! ( 접근 권한이 없습니다! )");
        }
        return next();
    } catch (e) {
        return next(e);
    }
};

export default userOwnerCheck;