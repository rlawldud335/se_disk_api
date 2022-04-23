import { Router } from 'express';

import FileService from '../../services/file';
import middlewares from '../middlewares';

const route = Router();
const FileInstance = new FileService();

export default (app) => {
    app.use('/file', route);

    //pdf 변환용 업로드
    route.post('/uploadPDF',
        middlewares.uploadFile.array('attachments'),
        async (req, res, next) => {
            try {
                const files = await FileInstance.CreateFile(req.files);
                const pdfFiles = await FileInstance.ConvertPDF(files);
                res.status(200).json({ sucess: true, files: files.concat(pdfFiles) });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )

    //그냥 업로드
    route.post('/upload',
        middlewares.uploadFile.array('attachments'),
        async (req, res, next) => {
            try {
                const files = await FileInstance.CreateFile(req.files);
                return res.status(200).json({ sucess: true, files: files });
            } catch (e) {
                return res.status(200).json({ sucess: false, errorMsg: e.message });
            }
        }
    )
};