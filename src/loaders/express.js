import bodyParser from "body-parser";
import cors from 'cors';
import routes from '../api';
import config from "../config";
import morgan from "morgan";

export default ({ app }) => {

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(morgan("dev"));
    app.use(cors());

    app.use(config.api.prefix, routes());
};