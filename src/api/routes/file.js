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

const upload = multer({ storage: storage });

const uploadDB = async (files) => {
    const InputRows = files.map((file) => {
        return {
            file_originname: file.originalname,
            file_filename: file.filename,
            file_filesize: file.size,
            file_extension: file.mimetype.split('/')[1],
            file_path: file.path
        }
    })
    const insertedRows = await models.files.bulkCreate(InputRows);
    const newFiles = insertedRows.map((file) => {
        delete file.dataValues.file_created_datetime;
        return file.dataValues;
    })
    return newFiles;
}

const convertPDF = async (files) => {

}

export default (app) => {
    app.use('/file', route);

    route.post('/uploadPDF',
        upload.array('attachments'),
        async (req, res, next) => {
            try {
                const files = await uploadDB(req.files);
                //PDF 변환
                //PDF로 변환한 파일 DB업로드
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    route.post('/upload',
        upload.array('attachments'),
        async (req, res, next) => {
            try {
                const files = await uploadDB(req.files);
                return res.status(200).json({ sucess: true, files: files });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )
};