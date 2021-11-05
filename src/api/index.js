import { Router } from 'express';
import auth from './routes/auth';
import user from "./routes/user";
import project from "./routes/project";
import post from "./routes/post";

export default () => {
    const app = Router();

    auth(app);
    user(app);
    project(app);
    post(app);

    return app
}