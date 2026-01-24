const { Queue, Worker } = require('bullmq');
const { embeddingsTextDocument } = require('../services/documentProcessor');

const connection = { host: process.env.REDIS_HOST || 'redis', port: 6379 };

const documentQueue = new Queue('documents', { connection });

module.exports = { documentQueue };

const worker = new Worker('documents', async job => {
    const { chroma_id, mime, storedFilename } = job.data;
    if (mime === 'text/plain') {
        embeddingsTextDocument([storedFilename],[chroma_id]);
    }
}, {
    concurrency: 3,
    connection
});