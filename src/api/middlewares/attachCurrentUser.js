import models from "../../database/models";
import jwt from "jsonwebtoken";
import config from "../../config";

const attachCurrentUser = async (req, res, next) => {
    try {
        if(req.headers.authorization){
            const jwtvf = jwt.verify(req.headers.authorization.split(' ')[1], config.jwtSecret);
            const user = await models.users.findOne({where:{user_id:jwtvf._id},raw:true});
            delete user.user_password;
            delete user.user_salt;
            req.user = user;
        }
        return next();
    } catch (e) {
        return next(e);
    }
};

export default attachCurrentUser;