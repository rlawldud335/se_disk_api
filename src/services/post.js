import models from "../database/models";

export default class PostService {

    async CreatePost(projectId, userId, postInput) {
        try {
            const post = await models.posts.create({
                post_title: postInput.post_title,
                post_content: postInput.post_content,
                project_id: projectId,
                user_id: userId,
            })
            if (postInput.post_files) {
                const files = postInput.post_files.map((file) => {
                    return {
                        post_id: post.post_id,
                        file_id: file,
                    }
                })
                await models.posts_attachments.bulkCreate(files);
            }
            const query = `
            SELECT posts.*,
            JSON_ARRAYAGG(JSON_OBJECT(
            "file_id", files.file_id,
            "file_originname", files.file_originname,
            "file_filename", files.file_filename,
            "file_extension",files.file_extension,
            "file_created_datetime", files.file_created_datetime,
            "file_path",files.file_path
            )) AS files
            FROM se_disk.posts posts
            JOIN se_disk.posts_attachments attach
                ON attach.post_id = posts.post_id
            JOIN se_disk.files files
                ON attach.file_id = files.file_id
            WHERE posts.post_id = :postId;
            `;

            const [newPost] = await models.sequelize.query(query, {
                replacements: { postId: post.post_id },
                type: models.sequelize.QueryTypes.SELECT,
                raw: true
            });
            return newPost;
        } catch (e) {
            throw e;
        }
    }

    async UpdatePost(projectId, postId, postInput) {
        try {
            await models.posts.update({
                post_title: postInput.post_title,
                post_content: postInput.post_content,
            }, {
                where: {
                    project_id: projectId
                },
                raw: true
            })
            if (postInput.post_files) {
                //기존 파일 삭제
                await models.posts_attachments.destroy({
                    where: { post_id: postId }
                })
                //새로운 파일 추가
                const files = postInput.post_files.map((file) => {
                    return {
                        post_id: postId,
                        file_id: file,
                    }
                })
                await models.posts_attachments.bulkCreate(files);
            }
            const query = `
            SELECT posts.*,
            JSON_ARRAYAGG(JSON_OBJECT(
            "file_id", files.file_id,
            "file_originname", files.file_originname,
            "file_filename", files.file_filename,
            "file_extension",files.file_extension,
            "file_created_datetime", files.file_created_datetime,
            "file_path",files.file_path
            )) AS files
            FROM se_disk.posts posts
            JOIN se_disk.posts_attachments attach
                ON attach.post_id = posts.post_id
            JOIN se_disk.files files
                ON attach.file_id = files.file_id
            WHERE posts.post_id = :postId;
            `;

            const [post] = await models.sequelize.query(query, {
                replacements: { postId },
                type: models.sequelize.QueryTypes.SELECT,
                raw: true
            });
            return post;
        } catch (e) {
            throw e;
        }
    }

    async GetPost(postId) {
        try {
            const query = `
            SELECT posts.*,
            JSON_ARRAYAGG(JSON_OBJECT(
            "file_id", files.file_id,
            "file_originname", files.file_originname,
            "file_filename", files.file_filename,
            "file_extension",files.file_extension,
            "file_created_datetime", files.file_created_datetime,
            "file_path",files.file_path
            )) AS files
            FROM se_disk.posts posts
            JOIN se_disk.posts_attachments attach
                ON attach.post_id = posts.post_id
            JOIN se_disk.files files
                ON attach.file_id = files.file_id
            WHERE posts.post_id = :postId;
            `;

            const [post] = await models.sequelize.query(query, {
                replacements: { postId },
                type: models.sequelize.QueryTypes.SELECT,
                raw: true
            });
            return post;
        } catch (e) {
            throw e;
        }
    }

    async GetPostList(projectId) {
        try {
            const posts = await models.posts.findAndCountAll({
                where: { project_id: projectId },
                raw: true
            })
            return { count: posts.count, posts: posts.rows };
        } catch (e) {
            throw e;
        }
    }
}