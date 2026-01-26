const pdfParse = require('pdf-parse');
const fs = require('fs');
const ollamaService = require('../services/ollamaService');
const documentProcessor = require('../services/documentProcessor');
const { Chroma } = require("@langchain/community/vectorstores/chroma");
const { Ollama } = require("@langchain/community/llms/ollama");
const { OllamaEmbeddings } = require("@langchain/community/embeddings/ollama");
const { STATUS_CODES } = require('http');
const db = require('../db');
const { documentQueue } = require('../queues/documentEmb');
const { queriesQueue } = require('../queues/queryQueue');

//const OLLAMA_URL = process.env.OLLAMA_URL;
const OLLAMA_URL = 'http://host.docker.internal:11434';
const MODEL_EMB = process.env.MODEL_EMB;
const CHROMA_URL = process.env.CHROMA_URL;
const MODEL_LLM = process.env.MODEL_LLM;

exports.deleteDoc = async (req,res) => {
  try {
    const docsResult = await db.query(`
          SELECT *
          FROM documents 
          WHERE (id = $1) 
        `, [req.params.docId]);

    const rmResult = await fs.promises.rm(`uploads/${docsResult.rows[0].filename}`);

    const deleteResult = await db.query(`
          DELETE FROM documents 
          WHERE id = $1
        `, [req.params.docId]);
    res.status(200).json({});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

exports.processPdf = async (req, res) => {
  try {
    const pdfFile = req.file;
    const dataBuffer = await fs.promises.readFile(pdfFile.path);
    const data = await pdfParse(dataBuffer);
    const text = data.text;

    const processedText = await ollamaService.processText(text);

    res.json({ result: processedText });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.processTxt = async (req, res) => {
  try {
    const files = req.files;
    const user_id = req.userId;
    for (var k = 0; k < files.length; k++) {
      title = files[k].originalname;
      mimetype = files[k].mimetype;
      filename = files[k].filename;
      size = files[k].size;
      
      db_result = await db.query('INSERT INTO documents (user_id,title,filename,mime_type,size_bytes) VALUES ($1,$2,$3,$4,$5) RETURNING chroma_id,user_id', [user_id,title,filename,mimetype,size]);
      if (db_result.rows.length > 0) {
        cid = db_result.rows[0].chroma_id;
        uid = db_result.rows[0].user_id;
        await documentQueue.add('ingest', {
          chroma_id: cid,
          mime: mimetype,
          storedFilename: filename,
          user_id: uid
        });
      }
    }

    res.json({result: "Uploaded"});
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.getRAGQueryResponse = async (req, res) => {
  try {
    const query = req.body.RAGQuery;
    const uid = req.userId;

    const db_result = await db.query(`
      INSERT INTO documents 
      (user_id,question) 
      VALUES (${uid},${query})
      RETURNING id`);
    
    if (db_result.rows.length > 0) {
        qid = db_result.rows[0].id;
        await queriesQueue.add('ingest', {
          query, user_id, "query_id": qid
        });
      }

    res.json({ result: "Query Job Started" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.clearDB = async (req, res) => {
  try {
    const collection_name = req.body.collection;
    const resp = await documentProcessor.deleteTextEmbeddings(collection_name);
    res.json({ result: "OK" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


