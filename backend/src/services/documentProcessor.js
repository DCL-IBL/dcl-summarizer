const { TextLoader } = require("langchain/document_loaders/fs/text");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { Chroma } = require("@langchain/community/vectorstores/chroma");
const { OllamaEmbeddings } = require("@langchain/community/embeddings/ollama");
const { ChromaClient } = require("chromadb");

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL_EMB = process.env.MODEL_EMB
const CHROMA_URL = process.env.CHROMA_URL

exports.embeddingsTextDocument = async function(filePath) {
    // Load text document
    const loader = new TextLoader(filePath);
    const docs = await loader.load();
  
    // Configure text splitting
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200
    });
  
    // Split and store documents
    const splitDocs = await splitter.splitDocuments(docs);
        
    const embeddings = new OllamaEmbeddings({ baseUrl: OLLAMA_URL, model: MODEL_EMB });
    
    const vectorStore = new Chroma(
      embeddings,
      { 
        collectionName: "text_docs",
        url: CHROMA_URL 
      }
    );
    await vectorStore.addDocuments(splitDocs);
  
    return vectorStore;
  }

exports.deleteTextEmbeddings = async function(collection_name) {
    const client = new ChromaClient({ path: CHROMA_URL });
    const collection = await client.getCollection({ name: collection_name });
    await client.deleteCollection(collection);
    return 0;    
}

