const PDFLoader = require("langchain/document_loaders/fs/pdf");
const TextLoader = require("langchain/document_loaders/fs/text");
const RecursiveCharacterTextSplitter = require("langchain/text_splitter");
const Chroma = require("@langchain/community/vectorstores/chroma");
const OllamaEmbeddings = require("@langchain/community/embeddings/ollama");

export async function embeddingsPDFDocument(filePath) {
  const loader = new PDFLoader(filePath);
  const docs = await loader.load();
  
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200
  });

  const splitDocs = await splitter.splitDocuments(docs);
  
  const vectorStore = await Chroma.fromDocuments(
    splitDocs,
    new OllamaEmbeddings({ model: "deepseek-r1" }),
    { collectionName: "pdf_docs", url: "http://chromadb:8001" }
  );

  return vectorStore;
}

export async function embeddingsTextDocument(filePath) {
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

