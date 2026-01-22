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

exports.receiveDocument = async function(files,user_id) {
  for (var k = 0; k < files.length; k++) {
    title = files[k].originalname;
    mimetype = files[k].mimetype;
    filename = files[k].filename;
    size = files[k].size;
    row = await db.query('INSERT INTO documents (user_id,title,filename,mime_type,size_bytes) VALUES ($1,$2,$3,$4,$5)', [user_id,title,filename,mimetype,size]);
  }
}

exports.embeddingsTextDocument = async function(files,user_id) {
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
    files.forEach(async (file) => {
      const loader = new TextLoader(file.path);
      var doc1 = await loader.load();
      doc1[0].metadata.user_id = user_id;
      console.log(doc1);

      const ids = await vectorStore.addDocuments(doc1);
      console.log(ids);
    });
  
    // Split and store documents
    // const splitDocs = await splitter.splitDocuments(document1);
    
    //await vectorStore.addDocuments(splitDocs);
  
    return vectorStore;
  }

exports.deleteTextEmbeddings = async function(collection_name) {
    const client = new ChromaClient({ path: CHROMA_URL });
    const collection = await client.getCollection({ name: collection_name });
    await client.deleteCollection(collection);
    return 0;    
}

