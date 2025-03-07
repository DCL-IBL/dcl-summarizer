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
    const prompt = `Резюмирай следния текст в 3 изречения и предостави информацията в JSON формат, като включиш 5 ключови думи, 3 категории и 3 въпроса, които могат да бъдат зададени, като използваш следният JSON шаблон: {"ключови_думи": ["Исак Нютон", "класическа механика", "закон за всемирното привличане", "математически анализ", "рефлекторен телескоп"],"категории": ["Научна революция", "Физика", "Математика"],"въпроси": ["Кои са трите закона за движение, формулирани от Исак Нютон?","Как Нютон допринася за развитието на оптиката и теорията за цветовете?","Защо религиозните възгледи на Нютон се смятат за неортодоксални?"],"резюме": ["Исак Нютон е английски учен с фундаментален принос в физиката, математиката и астрономията, считан за ключова фигура в Научната революция.","Той формулира законите за движение и гравитацията, поставяйки основите на класическата механика, разработва математически анализ и изследва природата на светлината, създавайки първия рефлекторен телескоп.","Освен научната дейност, Нютон изследва религиозни и окултни теми, отхвърляйки догми като Светата Троица, и участва в интерпретации на библейски текстове."]}. Контекст: ${results.map(r => r.pageContent).join("\n")}. Текст за резюмиране: ${query}`;

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


