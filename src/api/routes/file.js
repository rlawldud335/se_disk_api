import { Router } from 'express';
import multer from "multer";
import path from "path";
import models from "../../database/models";

const route = Router();

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'file/');
    },
    filename(req, file, cb) {
        cb(null, `file__${Date.now()}${path.extname(file.originalname)}`);
    },
});

var upload = multer({ storage: storage });

export default (app) => {
    app.use('/file', route);

    route.post('/upload',
        upload.array('attachments'),
        async (req, res, next) => {
            try {
                //파일 디비에 넣기
                const InputRows = req.files.map((file) => {
                    return {
                        file_originname: file.originalname,
                        file_filename: file.filename,
                        file_filesize: file.size,
                        file_extension: file.mimetype.split('/')[1],
                        file_path: file.path
                    }
                })
                console.log(InputRows)
                const newFiles = await models.files.bulkCreate(InputRows);
                const files = newFiles.map((file) => {
                    delete file.dataValues.file_created_datetime;
                    return file.dataValues;
                })
                return res.status(200).json({ sucess: true, files: files });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )
};