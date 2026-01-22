const db = require('../db');

exports.getUserDocs = async function(user_id) {
    try {
    const userDocsResult = await db.query(`
      SELECT *
      FROM documents 
      WHERE (user_id = $1)
      ORDER BY created_at DESC 
    `, [user_id]);

    return userDocsResult.rows;
    } catch(error) {
        console.log(error);
        return {};
    }
}