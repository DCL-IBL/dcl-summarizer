const { TextLoader } = require("langchain/document_loaders/fs/text");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { Chroma } = require("@langchain/community/vectorstores/chroma");
const { OllamaEmbeddings } = require("@langchain/community/embeddings/ollama");
const { ChromaClient } = require("chromadb");
const { Document } = require("@langchain/core/documents");
const db = require('../db');

//const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_URL = 'http://host.docker.internal:11434';
const MODEL_EMB = process.env.MODEL_EMB
const CHROMA_URL = process.env.CHROMA_URL

exports.embeddingsTextDocument = async function(file,cid) {
  try {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200
    });

    const embeddings = new OllamaEmbeddings({ baseUrl: OLLAMA_URL, model: MODEL_EMB });
    
    const vectorStore = new Chroma(
      embeddings,
      { 
        collectionName: "text_docs",
        url: CHROMA_URL 
      }
    );

    // Load text document
    const loader = new TextLoader(`uploads/${file}`);
    var doc1 = await loader.load();

    const ids = await vectorStore.addDocuments(doc1,{ cid });
    console.log(`Added document to text_docs with id ${cid}`);

    const updateResult = await db.query(`
            UPDATE documents
            SET status = 'ready', chunk_count = 0, updated_at = now() WHERE chroma_id = '${cid}'
            `);
  
    // Split and store documents
    // const splitDocs = await splitter.splitDocuments(document1);
    
    //await vectorStore.addDocuments(splitDocs);
  } catch (err) {
    console.log(err.message);
  }
}

exports.deleteTextEmbeddings = async function(collection_name) {
    const client = new ChromaClient({ path: CHROMA_URL });
    const collection = await client.getCollection({ name: collection_name });
    await client.deleteCollection(collection);
    return 0;    
}

