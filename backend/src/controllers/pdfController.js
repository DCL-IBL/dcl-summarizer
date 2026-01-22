const pdfParse = require('pdf-parse');
const fs = require('fs');
const ollamaService = require('../services/ollamaService');
const documentProcessor = require('../services/documentProcessor');
const { Chroma } = require("@langchain/community/vectorstores/chroma");
const { Ollama } = require("@langchain/community/llms/ollama");
const { OllamaEmbeddings } = require("@langchain/community/embeddings/ollama");
const { STATUS_CODES } = require('http');
const db = require('../db');

const OLLAMA_URL = process.env.OLLAMA_URL;
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

    const upload_result = await documentProcessor.receiveDocument(files,req.userId);
    //const process_result = await documentProcessor.embeddingsTextDocument(files,req.userId);

    res.json({result: "Uploaded"});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

handleRAGQuery = async (query) => {
  const vectorStore = new Chroma(
    new OllamaEmbeddings({ baseUrl: OLLAMA_URL, model: MODEL_EMB }),
    { collectionName: "text_docs", url: CHROMA_URL }
  );

  const results = await vectorStore.similaritySearch(query, 3);
  
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
    console.log(prompt);
  return llm.invoke(prompt);
};

exports.getRAGQueryResponse = async (req, res) => {
  try {
    const query = req.body.RAGQuery;
    const qres = await handleRAGQuery(query);
    res.json({ result: qres });
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


