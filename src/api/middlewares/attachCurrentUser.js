import models from "../../database/models";

const attachCurrentUser = async (req, res, next) => {
    try {
        const user = await models.users.findOne({ where: { user_id: req.user._id }, raw: true });
        delete user.user_password;
        delete user.user_salt;
        req.currentUser = user;
        return next();
    } catch (e) {
        return next(e);
    }
};

export default attachCurrentUser;