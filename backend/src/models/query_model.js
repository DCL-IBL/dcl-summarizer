const db = require('../db');

exports.getUserQueries = async function(user_id) {
    try {
    const userQueryResult = await db.query(`
      SELECT *
      FROM queries 
      WHERE (user_id = $1)
      ORDER BY created_at DESC 
    `, [user_id]);

    return userQueryResult.rows;
    } catch(error) {
        console.log(error);
        return {};
    }
}