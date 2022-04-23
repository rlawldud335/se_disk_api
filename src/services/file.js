import models from "../database/models";
import child_process from "child_process";
import fs from "fs";

export default class FileService {

    async CreateFile(files){
        try{
            const InputRows = files.map((file) => {
                let fileLength = file.originalname.length;
                let fileDot = file.originalname.lastIndexOf(".");
                let fileType = file.originalname.substring(fileDot+1, fileLength).toLowerCase();
                return {
                    file_originname: file.originalname,
                    file_filename: file.filename,
                    file_filesize: file.size,
                    file_extension: fileType,
                    file_path: file.path
                }
            })
            const insertedRows = await models.files.bulkCreate(InputRows);
            const newFiles = insertedRows.map((file) => {
                return file.dataValues;
            })
            return newFiles;
        }catch(e){
            throw e;
        }
    }
    async ConvertPDF(cvfiles){
        try{
            const files = cvfiles.filter((file)=>{
                if(file.file_extension=='hwp'||file.file_extension=='docx'||file.file_extension=='pptx'||file.file_extension=='xlsx'){
                    return file;
                }
            })
            const InputRows = files.map((file) => {
                const pdfFilename = file.file_filename.split('.')[0]+'.pdf';
                child_process.spawn('python',['Convert.py',file.file_filename]);
                    return {
                        file_originname: pdfFilename,
                        file_filename: pdfFilename,
                        file_filesize: 10,
                        file_extension: 'pdf',
                        file_path: `file\\pdf\\${pdfFilename}`
                    }
            })
            const insertedRows = await models.files.bulkCreate(InputRows);
            const newFiles = insertedRows.map((file) => {
                return file.dataValues;
            })
            return newFiles;
        }catch(e){
            throw e;
        }
    }
}