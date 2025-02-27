const { TextLoader } = require("langchain/document_loaders/fs/text");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { Chroma } = require("@langchain/community/vectorstores/chroma");
const { OllamaEmbeddings } = require("@langchain/community/embeddings/ollama");

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

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
    
    const embeddings = new OllamaEmbeddings({ baseURL: OLLAMA_URL, model: "deepseek-r1" });
   
    const vectorStore = await Chroma.fromDocuments(
      splitDocs,
      new OllamaEmbeddings({ baseURL: OLLAMA_URL, model: "deepseek-r1" }),
      { 
        collectionName: "text_docs",
        url: "http://localhost:8001" 
      }
    );
    console.log("vectorStore created");
  
    return vectorStore;
  }

