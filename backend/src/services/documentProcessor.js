const TextLoader = require("langchain/document_loaders/fs/text");
const RecursiveCharacterTextSplitter = require("langchain/text_splitter");
const Chroma = require("@langchain/community/vectorstores/chroma");
const OllamaEmbeddings = require("@langchain/community/embeddings/ollama");

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
    
    const vectorStore = await Chroma.fromDocuments(
      splitDocs,
      new OllamaEmbeddings({ model: "deepseek-r1" }),
      { 
        collectionName: "text_docs",
        url: "http://chromadb:8001" 
      }
    );
  
    return vectorStore;
  }

