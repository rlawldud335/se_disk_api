import cron from "node-cron";
import models from "../database/models";

const CronRecruitment = async()=>{
    try{
        console.log('---------cron job start---------')
        const query1 = `
        UPDATE se_disk.recruitments recruitments
        SET recruitments.recruitment_stat =  '마감'
        WHERE recruitment_deadline_date < DATE(NOW());
        `;
        const query2 = `
        DELETE ap, re
        FROM se_disk.applications ap
        LEFT JOIN se_disk.recruitments re
        ON ap.recruitment_id = re.recruitment_id
        WHERE (DATE_ADD(re.recruitment_deadline_date, INTERVAL 30 DAY) < DATE(NOW())) and (re.recruitment_stat='마감');
        `;
        await models.sequelize.query(query1, {
            type: models.sequelize.QueryTypes.UPDATE,
            raw: true
        });
        await models.sequelize.query(query2, {
            type: models.sequelize.QueryTypes.DELETE,
            raw: true
        });
    }catch(e){
        console.log(e);
    }
}

var task = cron.schedule('0 * * * *',CronRecruitment, {
    scheduled: false
});

export default task;
