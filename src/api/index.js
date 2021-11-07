import { Router } from 'express';
import auth from './routes/auth';
import user from "./routes/user";
import project from "./routes/project";
import post from "./routes/post";
import comment from "./routes/comment";

export default () => {
    const app = Router();

    auth(app);
    user(app);
    project(app);
    post(app);
    // comment(app);

    return app
}