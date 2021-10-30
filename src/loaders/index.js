import expressLoader from './express';
import db from "../database/models";

export default async ({ expressApp }) => {

    await expressLoader({ app: expressApp });

    await db.sequelize.sync()
        .then(
            () => { console.log('DB 연결성공'); }
        ).catch(
            () => { console.log('DB 연결실패'); }
        );
};