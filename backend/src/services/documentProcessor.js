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

exports.embeddingsTextDocument = async function(file,cid,user_id) {
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
    doc1[0].metadata.uid = user_id;
    doc1[0].id = cid;
    
    const ids = await vectorStore.addDocuments(doc1,{ "ids":[cid] });
    console.log(`Added document to text_docs with id ${cid} to user id ${user_id}`);

    const updateResult = await db.query(`
            UPDATE documents
            SET status = 'ready', chunk_count = 0, updated_at = now() WHERE chroma_id = '${cid}'
            `);
  
    // Split and store documents
    // const splitDocs = await splitter.splitDocuments(document1);
    
    //await vectorStore.addDocuments(splitDocs);
  } catch (err) {
    console.log(err.message);
    throw err;
  }
}

exports.deleteTextEmbeddings = async function(collection_name) {
    const client = new ChromaClient({ path: CHROMA_URL });
    const collection = await client.getCollection({ name: collection_name });
    await client.deleteCollection(collection);
    return 0;    
}

exports.handleRAGQuery = async (query,user_id,query_id) => {
  try {
    const vectorStore = new Chroma(
      new OllamaEmbeddings({ baseUrl: OLLAMA_URL, model: MODEL_EMB }),
      { collectionName: "text_docs", url: CHROMA_URL }
    );

    const results = await vectorStore.similaritySearch(query, 3, { uid: user_id });
    //console.log(results);
  
    const llm = new Ollama({ baseUrl: OLLAMA_URL, model: MODEL_LLM });
    const prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>
	  You are an advanced language model capable of summarizing text and generating structured outputs. Your task is to:
	  1. Summarize the provided text using context retrieved from external sources (RAG context).
	  2. Output the summary strictly in JSON format.
	  3. Answer in Bulgarian language.
	  4. The JSON should include:
	  - "keywords": A list of 5 key terms that capture the essence of the text.
	  - "questions": A list of 3 questions that should be addressed based on the text.
	  - "categories": A classification of the text into 3 categories.
	  - "summary": A short summary of the provided text

	  Ensure your response is valid JSON with no additional text outside the JSON object.

	  <|eot_id|><|start_header_id|>user<|end_header_id|>
	  Here is the input text: "${query}"

    RAG Context: "${results.map(r => r.pageContent).join("\n")}"

    Expected Output Format:
    {
	"keywords": ["ключова дума 1", "ключова дума 2", "ключова дума 3", "ключова дума 4", "ключова дума 5"],
	"questions": ["Въпрос 1", "Въпрос 2", "Въпрос 3"],
	"categories": ["Категория 1", "Категория 2", "Категория 3"],
	"summary": "резюме на текста"
    }
	<|eot_id|><|start_header_id|>assistant<|end_header_id|>`;
    //console.log(prompt);
    await llm.invoke(prompt);

    console.log(`LLM invoke for user id ${user_id} and query id ${qid}`);

    const updateResult = await db.query(`
            UPDATE queries
            SET status = 'ready', updated_at = now() WHERE id = '${query_id}'
            `);
  } catch (err) {
    console.log(err.message);
    throw err;
  };
};
