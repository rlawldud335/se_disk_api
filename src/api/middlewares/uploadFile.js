import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination(req, file, cb) {
        const ext = path.extname(file.originalname)
        switch (ext){
            case '.hwp':
                cb(null, 'file/hwp/');
                break;
            case '.pptx':
                cb(null, 'file/pptx/');
                break;
            case '.xlsx':
                cb(null, 'file/xlsx/');
                break;
            case '.docx':
                cb(null, 'file/docx/');
                break;
            case '.pdf':
                cb(null, 'file/pdf/');
                break;
            case '.png':
            case '.jpg':
            case '.jpeg':
            case '.gif':
                cb(null, 'file/image/');
                break;
            case '.mp4':
            case '.mp3':
            case '.avi':
            case '.mov':
            case '.wmv':
            case '.webm':
                cb(null, 'file/video/');
                break;
            default:
                cb(new Error('지원하지않는 확장자 입니다.'), null);
        }
    },
    filename(req, file, cb) {
        cb(null, `file__${Date.now()}${path.extname(file.originalname)}`);
    },
});

const fileFilter = (req, file, callback)=>{
    let ext = path.extname(file.originalname)
    if(ext!=='.png'&&ext!=='.jpg'&&ext!=='.jpeg'&&ext!=='.gif'
        &&ext!=='.mp4'&&ext!=='.mp3'&&ext!=='.avi'&&ext!=='.mov'&&ext!=='.wmv'&&ext!=='.webm'
        &&ext!=='.hwp'&&ext!=='.pptx'&&ext!=='.xlsx'&&ext!=='.docx'&&ext!=='.pdf'
    ){
        return callback(new Error('지원하지않는 확장자 입니다.'), null)
    }
    callback(null, true)
}

const upload = multer({ storage: storage, fileFilter:fileFilter });

export default upload;