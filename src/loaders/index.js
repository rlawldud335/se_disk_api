import expressLoader from './express';
import db from "../database/models";
import jobs from "../jobs/recruitment";

export default async ({ expressApp }) => {

    await db.sequelize.sync()
    .then(
        () => { console.log('DB 연결성공'); }
    ).catch(
        () => { console.log('DB 연결실패'); }
    );

    jobs.start();

    await expressLoader({ app: expressApp });
};