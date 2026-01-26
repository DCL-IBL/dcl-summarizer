const { Queue, Worker } = require('bullmq');

const connection = { host: process.env.REDIS_HOST || 'redis', port: 6379 };

const queriesQueue = new Queue('queries', { connection });

const { handleRAGQuery } = require('../services/documentProcessor');

module.exports = { queriesQueue };

const worker = new Worker('queries', async job => {
    const { query, user_id, query_id } = job.data;
    await handleRAGQuery(query,user_id,query_id);
}, {
    concurrency: 3,
    connection
});