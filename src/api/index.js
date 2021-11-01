import { Router } from 'express';
import auth from './routes/auth';
import user from "./routes/user";
import project from "./routes/project";

export default () => {
    const app = Router();

    auth(app);
    user(app);
    project(app);

    return app
}