const pdfParse = require('pdf-parse');
const fs = require('fs');
const ollamaService = require('../services/ollamaService');
const Chroma = require("@langchain/community/vectorstores/chroma");
const Ollama = require("@langchain/community/llms/ollama");
const OllamaEmbeddings = require("@langchain/community/embeddings/ollama");

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

exports.handleRAGQuery = async (query) => {
  const vectorStore = new Chroma(
    new OllamaEmbeddings({ model: "deepseek-r1" }),
    { collectionName: "pdf_docs", url: "http://chromadb:8001" }
  );

  const results = await vectorStore.similaritySearch(query, 3);
  
  const llm = new Ollama({ model: "deepseek-r1" });
  const prompt = `Context: ${results.map(r => r.pageContent).join("\n")}
  Question: ${query}
  Answer: `;

  return llm.invoke(prompt);
}
