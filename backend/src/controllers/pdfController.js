const pdfParse = require('pdf-parse');
const fs = require('fs');
const ollamaService = require('../services/ollamaService');
const documentProcessor = require('../services/documentProcessor');
const { Chroma } = require("@langchain/community/vectorstores/chroma");
const { Ollama } = require("@langchain/community/llms/ollama");
const { OllamaEmbeddings } = require("@langchain/community/embeddings/ollama");

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
    const txtFile = req.file;
        
    const processedText = await documentProcessor.embeddingsTextDocument(txtFile.path);

    res.json({ result: txtFile.path });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

handleRAGQuery = async (query) => {
  const vectorStore = new Chroma(
    new OllamaEmbeddings({ baseUrl: "http://ollama:11434", model: "deepseek-r1" }),
    { collectionName: "text_docs", url: "http://chromadb:8000" }
  );

  const results = await vectorStore.similaritySearch(query, 3);
  
  const llm = new Ollama({ baseUrl: "http://ollama:11434", model: "deepseek-r1" });
  const prompt = `Context: ${results.map(r => r.pageContent).join("\n")}
  Question: ${query}
  Answer: `;

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
